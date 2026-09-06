import path from 'path';
import fs from 'fs';

// sql.js exposes a synchronous factory when loaded via require in Node
// We use a lazy initialization approach - init is called before server starts
const dbPath = path.join(__dirname, '../../farmdirect.db');

let sqlDb: any = null;

export async function initDb() {
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(buffer);
  } else {
    sqlDb = new SQL.Database();
  }
  sqlDb.run('PRAGMA foreign_keys = ON');
}

let inTransaction = false;

function save() {
  if (!sqlDb || inTransaction) return;
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

const db = {
  exec(sql: string) {
    sqlDb.run(sql);
    save();
  },

  prepare(sql: string) {
    return {
      run(...params: any[]) {
        sqlDb.run(sql, params);
        const result = sqlDb.exec('SELECT last_insert_rowid() as id, changes() as changes');
        save();
        const lastInsertRowid = result.length > 0 ? Number(result[0].values[0][0]) : 0;
        const changes = result.length > 0 ? Number(result[0].values[0][1]) : 0;
        return { lastInsertRowid, changes };
      },
      get(...params: any[]): any {
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        let row: any = undefined;
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
        stmt.free();
        return row;
      },
      all(...params: any[]): any[] {
        const results: any[] = [];
        const stmt = sqlDb.prepare(sql);
        stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  },

  transaction(fn: () => void) {
    return () => {
      inTransaction = true;
      sqlDb.run('BEGIN TRANSACTION');
      try {
        fn();
        sqlDb.run('COMMIT');
        inTransaction = false;
        save();
      } catch (err) {
        try { sqlDb.run('ROLLBACK'); } catch (_) { /* already rolled back */ }
        inTransaction = false;
        throw err;
      }
    };
  },

  pragma(directive: string) {
    try {
      sqlDb.run(`PRAGMA ${directive}`);
    } catch (_e) {
      // Some pragmas not supported
    }
  }
};

export default db;
