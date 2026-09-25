import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  translateVeg: (name: string) => string;
}

const translations: Record<string, { en: string; te: string }> = {
  // Brand & Header
  'brand.name': { en: 'FarmDirect Hub', te: 'ఫార్మ్‌డైరెక్ట్ హబ్' },
  'brand.tagline': { en: 'From Farm to You, Without Middlemen', te: 'రైతుల నుండి నేరుగా మీకు - దళారులు లేకుండా' },
  'nav.language': { en: 'Language', te: 'భాష' },
  'nav.logout': { en: 'Logout', te: 'లాగౌట్' },
  'nav.notifications': { en: 'Notifications', te: 'నోటిఫికేషన్‌లు' },
  'nav.portal': { en: 'Portal', te: 'పోర్టల్' },

  // Roles
  'role.farmer': { en: 'Farmer', te: 'రైతు' },
  'role.consumer': { en: 'Consumer', te: 'వినియోగదారుడు' },
  'role.coordinator': { en: 'Coordinator', te: 'సమన్వయకర్త' },
  'role.admin': { en: 'Admin', te: 'నిర్వాహకుడు' },
  'role.adviser': { en: 'Agricultural Adviser', te: 'వ్యవసాయ సలహాదారు' },
  'role.largeScaleConsumer': { en: 'Large Scale Consumer', te: 'టోకు / భారీ వినియోగదారు' },
  'role.farmer.portal': { en: 'Farmer Portal', te: 'రైతు పోర్టల్' },
  'role.consumer.portal': { en: 'Consumer Portal', te: 'వినియోగదారుని పోర్టల్' },
  'role.coordinator.portal': { en: 'Coordinator Portal', te: 'సమన్వయకర్త పోర్టల్' },
  'role.admin.portal': { en: 'Admin Portal', te: 'నిర్వాహక పోర్టల్' },
  'role.adviser.portal': { en: 'Adviser Portal', te: 'సలహాదారు పోర్టల్' },
  'role.largeScaleConsumer.portal': { en: 'Large Scale Consumer Portal', te: 'భారీ వినియోగదారు పోర్టల్' },

  // Navigation Items
  'menu.dashboard': { en: 'Dashboard', te: 'డ్యాష్‌బోర్డ్' },
  'menu.marketplace': { en: 'Marketplace', te: 'కూరగాయల మార్కెట్' },
  'menu.myProduce': { en: 'My Produce', te: 'నా పంటలు' },
  'menu.addProduce': { en: 'Add Produce', te: 'పంటను జోడించండి' },
  'menu.cropAdvisory': { en: 'Crop Advisory', te: 'పంట సాగు సలహాలు' },
  'menu.diseaseDetection': { en: 'Crop Disease Detection', te: 'పంట తెగుళ్ల గుర్తింపు' },
  'menu.farmerSupport': { en: 'Farmer Support', te: 'రైతు మద్దతు' },
  'menu.myOrders': { en: 'My Orders', te: 'నా ఆర్డర్లు' },
  'menu.myCart': { en: 'My Cart', te: 'నా కార్ట్' },
  'menu.myEarnings': { en: 'My Earnings', te: 'నా సంపాదన' },
  'menu.vegetablePrices': { en: 'Vegetable Prices', te: 'కూరగాయల ధరలు' },
  'menu.farmers': { en: 'Farmers', te: 'రైతులు' },
  'menu.consumers': { en: 'Consumers', te: 'వినియోగదారులు' },
  'menu.coordinators': { en: 'Coordinators', te: 'సమన్వయకర్తలు' },
  'menu.advisers': { en: 'Advisers', te: 'సలహాదారులు' },
  'menu.bulkConsumers': { en: 'Bulk Buyers', te: 'భారీ కొనుగోలుదారులు' },
  'menu.products': { en: 'Products', te: 'ఉత్పత్తులు' },
  'menu.orders': { en: 'Orders', te: 'ఆర్డర్లు' },
  'menu.reports': { en: 'Reports', te: 'నివేదికలు' },
  'menu.settings': { en: 'Settings', te: 'సెట్టింగులు' },
  'menu.profile': { en: 'Profile', te: 'ప్రొఫైల్' },
  'menu.preBookedOrders': { en: 'Pre-Booked Orders', te: 'ముందస్తు బుకింగ్ ఆర్డర్లు' },
  'menu.completedOrders': { en: 'Completed Orders', te: 'పూర్తయిన ఆర్డర్లు' },
  'menu.customers': { en: 'Customers', te: 'కస్టమర్లు' },

  // Common UI Actions
  'common.back': { en: 'Back', te: 'వెనక్కి' },
  'common.next': { en: 'Next', te: 'తరువాత' },
  'common.save': { en: 'Save', te: 'భద్రపరచండి' },
  'common.saveChanges': { en: 'Save Changes', te: 'మార్పులను భద్రపరచండి' },
  'common.cancel': { en: 'Cancel', te: 'రద్దు చేయండి' },
  'common.edit': { en: 'Edit', te: 'సవరించండి' },
  'common.remove': { en: 'Remove', te: 'తొలగించండి' },
  'common.delete': { en: 'Delete', te: 'తొలగించండి' },
  'common.confirm': { en: 'Confirm', te: 'ఖరారు చేయండి' },
  'common.viewAll': { en: 'View All', te: 'అన్నీ చూడండి' },
  'common.loading': { en: 'Loading...', te: 'లోడ్ అవుతోంది...' },
  'common.submitting': { en: 'Submitting...', te: 'నమోదు చేయబడుతోంది...' },
  'common.success': { en: 'Success', te: 'విజయవంతమైంది' },
  'common.error': { en: 'Error', te: 'లోపం' },

  // Vegetables
  'veg.Tomatoes': { en: 'Tomatoes', te: 'టమాటాలు' },
  'veg.Tomato': { en: 'Tomato', te: 'టమాటా' },
  'veg.Ladies Finger': { en: 'Ladies Finger', te: 'బెండకాయ' },
  'veg.Cucumbers': { en: 'Cucumbers', te: 'దోసకాయలు' },
  'veg.Cucumber': { en: 'Cucumber', te: 'దోసకాయ' },
  'veg.Spinach': { en: 'Spinach', te: 'పాలకూర' },
  'veg.Bottle Gourd': { en: 'Bottle Gourd', te: 'సొరకాయ' },
  'veg.Carrots': { en: 'Carrots', te: 'క్యారెట్లు' },
  'veg.Carrot': { en: 'Carrot', te: 'క్యారెట్' },
  'veg.Brinjal': { en: 'Brinjal', te: 'వంకాయ' },
  'veg.Ridge Gourd': { en: 'Ridge Gourd', te: 'బీరకాయ' },
  'veg.Bitter Gourd': { en: 'Bitter Gourd', te: 'కాకరకాయ' },
  'veg.Tindora': { en: 'Tindora', te: 'దొండకాయ' },
  'veg.Cauliflower': { en: 'Cauliflower', te: 'క్యాలీఫ్లవర్' },
  'veg.Beans': { en: 'Beans', te: 'చిక్కుడుకాయలు' },
  'veg.Drumstick': { en: 'Drumstick', te: 'మునగకాయలు' },
  'veg.Potatoes': { en: 'Potatoes', te: 'బంగాళాదుంపలు' },
  'veg.Potato': { en: 'Potato', te: 'బంగాళాదుంప' },
  'veg.Onions': { en: 'Onions', te: 'ఉల్లిపాయలు' },
  'veg.Onion': { en: 'Onion', te: 'ఉల్లిపాయ' },
  'veg.Cabbage': { en: 'Cabbage', te: 'క్యాబేజీ' },
  'veg.Green Chilli': { en: 'Green Chilli', te: 'పచ్చిమిర్చి' },
  'veg.Green Chillies': { en: 'Green Chillies', te: 'పచ్చిమిర్చి' },
  'veg.Ginger': { en: 'Ginger', te: 'అల్లం' },
  'veg.Garlic': { en: 'Garlic', te: 'వెల్లుల్లి' },
  'veg.Coriander': { en: 'Coriander', te: 'కొత్తిమీర' },
  'veg.Mint': { en: 'Mint', te: 'పుదీనా' },
  'veg.Capsicum': { en: 'Capsicum', te: 'క్యాప్సికం' },
  'veg.Radish': { en: 'Radish', te: 'ముల్లంగి' },
  'veg.Beetroot': { en: 'Beetroot', te: 'బీట్‌రూట్' },

  // Units
  'unit.kg': { en: 'kg', te: 'కేజీ' },
  'unit.quintal': { en: 'quintal', te: 'క్వింటాల్' },
  'unit.bunch': { en: 'bunch', te: 'కట్ట' },
  'unit.piece': { en: 'piece', te: 'ముక్క' },
  'unit.dozen': { en: 'dozen', te: 'డజన్' },
  'unit.perKg': { en: '/ kg', te: '/ కేజీ' },
  'unit.perBunch': { en: '/ bunch', te: '/ కట్ట' },

  // Marketplace
  'market.searchPlaceholder': { en: 'Search fresh vegetables by name...', te: 'తాజా కూరగాయల పేరుతో వెతకండి...' },
  'market.allVegetables': { en: 'All Vegetables', te: 'అన్ని కూరగాయలు' },
  'market.allLocations': { en: 'All Locations', te: 'అన్ని ప్రాంతాలు' },
  'market.verifiedOnly': { en: 'Verified Farmers Only', te: 'ధృవీకరించబడిన రైతులు మాత్రమే' },
  'market.sortBy': { en: 'Sort by', te: 'క్రమబద్ధీకరించండి' },
  'market.recommended': { en: 'Recommended', te: 'సిఫార్సు చేయబడినవి' },
  'market.priceLowHigh': { en: 'Price: Low to High', te: 'ధర: తక్కువ నుండి ఎక్కువ' },
  'market.priceHighLow': { en: 'Price: High to Low', te: 'ధర: ఎక్కువ నుండి తక్కువ' },
  'market.available': { en: 'Available', te: 'అందుబాటులో ఉంది' },
  'market.inStock': { en: 'In Stock', te: 'స్టాక్ ఉంది' },
  'market.soldOut': { en: 'Sold Out', te: 'స్టాక్ అయిపోయింది' },
  'market.addToCart': { en: 'Add to Cart', te: 'కార్ట్‌కు జోడించండి' },
  'market.added': { en: 'Added!', te: 'చేర్చబడింది!' },
  'market.verified': { en: 'Verified Farmer', te: 'ధృవీకరించబడిన రైతు' },
  'market.noProducts': { en: 'No vegetables found matching your criteria.', te: 'మీ శోధనకు తగిన కూరగాయలు అందుబాటులో లేవు.' },
  'market.livePrice': { en: 'Mandated Market Price', te: 'నిర్ణయించిన మార్కెట్ ధర' },

  // Cart & Checkout
  'cart.title': { en: 'Shopping Cart', te: 'షాపింగ్ కార్ట్' },
  'cart.yourCart': { en: 'Your Cart', te: 'మీ కార్ట్' },
  'cart.empty': { en: 'Your cart is empty', te: 'మీ కార్ట్ ఖాళీగా ఉంది' },
  'cart.emptyDesc': { en: 'Browse our marketplace to add fresh farm produce to your cart.', te: 'తాజా కూరగాయలను ఎంచుకొని మీ కార్ట్‌కు జోడించండి.' },
  'cart.startShopping': { en: 'Start Shopping', te: 'షాపింగ్ ప్రారంభించండి' },
  'cart.goToMarketplace': { en: 'Go to Marketplace', te: 'కూరగాయల మార్కెట్‌కు వెళ్లండి' },
  'cart.summary': { en: 'Order Summary', te: 'ఆర్డర్ సారాంశం' },
  'cart.subtotal': { en: 'Subtotal', te: 'మొత్తం ధర' },
  'cart.deliveryFee': { en: 'Delivery Fee', te: 'డెలివరీ రుసుము' },
  'cart.free': { en: 'Free', te: 'ఉచితం' },
  'cart.freeHub': { en: 'Free (Hub Pickup)', te: 'ఉచితం (హబ్ వద్ద సేకరణ)' },
  'cart.total': { en: 'Total Amount', te: 'మొత్తం చెల్లించవలసినది' },
  'cart.checkout': { en: 'Proceed to Checkout', te: 'చెల్లింపుకు వెళ్లండి' },
  'cart.deliveryType': { en: 'Delivery Option', te: 'డెలివరీ ఎంపిక' },
  'cart.deliveryInfo': { en: 'Delivery Information', te: 'డెలివరీ వివరాలు' },
  'cart.hubPickup': { en: 'Hub Pickup (Free)', te: 'హబ్ వద్ద తీసుకోవడం (ఉచితం)' },
  'cart.homeDelivery': { en: 'Home Delivery (₹20)', te: 'ఇంటి వద్దకే డెలివరీ (₹20)' },
  'cart.homeDeliveryOption': { en: 'Home Delivery', te: 'ఇంటి వద్దకే డెలివరీ' },
  'cart.hubPickupOption': { en: 'Hub Pickup', te: 'హబ్ వద్ద తీసుకోవడం' },
  'cart.placeOrder': { en: 'Place Order', te: 'ఆర్డర్ నమోదు చేయండి' },
  'cart.confirmOrder': { en: 'Confirm & Place Order', te: 'ఆర్డర్‌ను ఖరారు చేయండి' },
  'cart.address': { en: 'Delivery Address', te: 'డెలివరీ చిరునామా' },
  'cart.shippingAddress': { en: 'Shipping Address', te: 'డెలివరీ చిరునామా' },
  'cart.streetAddress': { en: 'Street Address', te: 'వీధి / ఇంటి నంబర్' },
  'cart.village': { en: 'Village/City', te: 'గ్రామం / నగరం' },
  'cart.district': { en: 'District', te: 'జిల్లా' },
  'cart.state': { en: 'State', te: 'రాష్ట్రం' },
  'cart.pincode': { en: 'Pincode', te: 'పిన్‌కోడ్' },
  'cart.name': { en: 'Name', te: 'పేరు' },
  'cart.mobile': { en: 'Mobile Number', te: 'మొబైల్ నంబర్' },
  'cart.quantity': { en: 'Quantity', te: 'పరిమాణం' },
  'cart.itemsCount': { en: 'items', te: 'వస్తువులు' },
  'cart.fairTradeGuarantee': { en: 'Fair Trade Guarantee:', te: 'గిట్టుబాటు ధర హామీ:' },
  'cart.fairTradeDesc': { en: 'Prices are set by FarmDirect Hub admin and are non-negotiable. This ensures farmers receive fair compensation and consumers pay transparent, market-appropriate rates.', te: 'ధరలు ఫార్మ్‌డైరెక్ట్ హబ్ అడ్మిన్ ద్వారా నిర్ణయించబడతాయి. దీనివల్ల రైతులకు న్యాయమైన ధర, వినియోగదారులకు పారదర్శకమైన ధర లభిస్తుంది.' },
  'cart.calculatedAtCheckout': { en: 'Calculated at checkout', te: 'చెల్లింపు వద్ద లెక్కించబడుతుంది' },
  'cart.deliveryNote': { en: '+ Delivery charges if applicable', te: '+ వర్తించే డెలివరీ ఛార్జీలు' },
  'cart.codNotice': { en: 'Payment is collected upon delivery (COD).', te: 'డెలివరీ సమయంలో నగదు చెల్లింపు (COD).' },
  'cart.secureCheckout': { en: 'Secure checkout • Free cancellation before dispatch', te: 'సురక్షిత చెల్లింపు • డిస్పాచ్ కావడానికి ముందు ఉచిత రద్దు' },
  'cart.orderSuccessTitle': { en: 'Order Placed Successfully!', te: 'ఆర్డర్ విజయవంతంగా నమోదైంది!' },
  'cart.orderSuccessSubtitle': { en: 'Thank you for your purchase.', te: 'మా వద్ద కొనుగోలు చేసినందుకు ధన్యవాదాలు.' },
  'cart.orderNumber': { en: 'Order Number', te: 'ఆర్డర్ సంఖ్య' },
  'cart.viewOrders': { en: 'View My Orders', te: 'నా ఆర్డర్లను చూడండి' },
  'cart.continueShopping': { en: 'Continue Shopping', te: 'షాపింగ్ కొనసాగించండి' },
  'cart.fillDetails': { en: 'Please fill all delivery details', te: 'దయచేసి అన్ని డెలివరీ వివరాలను నమోదు చేయండి' },
  'cart.advanceDeposit': { en: 'Security Deposit (25% Pay Now)', te: 'భద్రతా డిపాజిట్ (ఇప్పుడు చెల్లించాల్సిన 25%)' },
  'cart.remainingAmount': { en: 'Remaining Balance (75% at Hub/Delivery)', te: 'మిగిలిన బ్యాలెన్స్ (హబ్/డెలివరీ వద్ద 75%)' },
  'cart.advanceNote': { en: 'Pay only 25% advance now as security deposit. Pay the remaining 75% upon produce collection.', te: 'ఆర్డర్ ధృవీకరణకు 25% మాత్రమే ముందస్తు డిపాజిట్ చెల్లించండి. మిగిలిన 75% పంట సేకరణ సమయంలో చెల్లించండి.' },
  'cart.minHubOrderNotice': { en: 'Minimum order for Hub Pickup is ₹100', te: 'హబ్ సేకరణకు కనీస ఆర్డర్ మొత్తం ₹100' },
  'cart.minDeliveryOrderNotice': { en: 'Minimum order for Home Delivery is ₹300', te: 'ఇంటి డెలివరీకి కనీస ఆర్డర్ మొత్తం ₹300' },
  'cart.minBulkOrderNotice': { en: 'Minimum order for Bulk Consumers is ₹500 (Hub Pickup Only)', te: 'భారీ వినియోగదారులకు కనీస ఆర్డర్ మొత్తం ₹500 (హబ్ వద్ద మాత్రమే)' },
  'cart.maxLimitNote': { en: 'Retail Consumers: Max 5 kg per vegetable. For wholesale/bulk, use Large Scale Consumer portal.', te: 'రిటైల్ వినియోగదారులు: కూరగాయకు గరిష్టంగా 5 కేజీలు మాత్రమే. టోకు/భారీ ఆర్డర్ల కోసం భారీ వినియోగదారు పోర్టల్ ఉపయోగించండి.' },
  'cart.orderTypeBulk': { en: 'Bulk Wholesale Order', te: 'భారీ / టోకు ఆర్డర్' },
  'cart.orderTypeRetail': { en: 'Retail Order', te: 'రిటైల్ ఆర్డర్' },

  // Crop Advisory
  'advisory.title': { en: 'Crop Cultivation Advisory & Profit Analytics', te: 'పంట సాగు సలహాలు & లాభాల విశ్లేషణ' },
  'advisory.subtitle': { en: 'Discover which crops yield maximum profits based on market trends and statistics.', te: 'మార్కెట్ విశ్లేషణ మరియు గణాంకాల ఆధారంగా ఏ పంట ఎక్కువ లాభం ఇస్తుందో తెలుసుకోండి.' },
  'advisory.statHeader': { en: 'Market Statistics & Crop Recommendations', te: 'మార్కెట్ గణాంకాలు & పంట సిఫార్సులు' },
  'advisory.estProfit': { en: 'Est. Profit / Acre', te: 'అంచనా లాభం / ఎకరాకు' },
  'advisory.estYield': { en: 'Avg. Yield / Acre', te: 'సగటు దిగుబడి / ఎకరాకు' },
  'advisory.mandatedPrice': { en: 'Govt / Hub Mandated Price', te: 'హబ్ నిర్ణయించిన ధర' },
  'advisory.farmerPrice': { en: 'Farmer Earning Price', te: 'రైతు నికర సంపాదన' },
  'advisory.margin': { en: 'Profit Margin', te: 'లాభ శాతం' },
  'advisory.demand': { en: 'Market Demand', te: 'మార్కెట్ డిమాండ్' },
  'advisory.activeCompetition': { en: 'Competing Local Farmers', te: 'స్థానిక పోటీ రైతులు' },
  'advisory.season': { en: 'Optimal Sowing Season', te: 'అనువైన విత్తే సమయం' },
  'advisory.harvestTime': { en: 'Harvest Duration', te: 'కోత సమయం' },
  'advisory.recommendation': { en: 'Expert Recommendation', te: 'నిపుణుల సిఫార్సు' },
  'advisory.highDemand': { en: 'High Demand', te: 'అధిక డిమాండ్' },
  'advisory.moderateDemand': { en: 'Moderate Demand', te: 'మధ్యస్థ డిమాండ్' },

  // Crop Disease Detection
  'disease.title': { en: 'Crop Disease Detection & Expert Consultation', te: 'పంట తెగుళ్ల గుర్తింపు & నిపుణుల సలహాలు' },
  'disease.subtitle': { en: 'Upload photos of diseased crops to receive verified remedies from certified agricultural advisers.', te: 'మీ పంట తెగులు ఫోటోను అప్‌లోడ్ చేసి ధృవీకరించబడిన వ్యవసాయ నిపుణుల నుండి మందులు & సలహాలు పొందండి.' },
  'disease.uploadTitle': { en: 'Submit Affected Crop for Diagnosis', te: 'నిర్ధారణ కొరకు పంట ఫోటోను సమర్పించండి' },
  'disease.cropName': { en: 'Crop Name', te: 'పంట పేరు' },
  'disease.symptoms': { en: 'Observed Symptoms / Damage', te: 'గమనించిన లక్షణాలు / నష్టం' },
  'disease.symptomsPlaceholder': { en: 'e.g. Yellow spots on leaves, wilting stems, curling, pest spots...', te: 'ఉదా: ఆకులపై పసుపు మచ్చలు, వాడిపోవడం, ముడుచుకుపోవడం, పురుగులు...' },
  'disease.affectedArea': { en: 'Affected Area / Acreage', te: 'ప్రభావితమైన విస్తీర్ణం' },
  'disease.cropPhoto': { en: 'Crop Photo (Clear close-up)', te: 'పంట ఫోటో (స్పష్టమైన దగ్గరి ఫోటో)' },
  'disease.submitConsultation': { en: 'Send to Adviser for Remedy', te: 'సలహా కోసం నిపుణుడికి పంపండి' },
  'disease.myCases': { en: 'My Disease Consultations', te: 'నా తెగులు సలహా అభ్యర్థనలు' },
  'disease.pendingReview': { en: 'Under Adviser Review', te: 'నిపుణుల పరిశీలనలో ఉంది' },
  'disease.advised': { en: 'Prescription Provided', te: 'మందుల సలహా ఇవ్వబడింది' },
  'disease.diagnosis': { en: 'Identified Disease', te: 'గుర్తించిన తెగులు' },
  'disease.prescription': { en: 'Treatment & Prescription', te: 'చికిత్స & మందుల సూచన' },
  'disease.adviserNotes': { en: 'Adviser Agronomic Notes', te: 'నిపుణుడి సూచనలు' },
  'disease.advisedBy': { en: 'Advised by Specialist', te: 'సలహా ఇచ్చిన నిపుణుడు' },

  // Adviser Portal
  'adviser.dashTitle': { en: 'Agricultural Adviser Portal', te: 'వ్యవసాయ సలహాదారు పోర్టల్' },
  'adviser.totalCases': { en: 'Total Consultations', te: 'మొత్తం సలహాలు' },
  'adviser.pendingCases': { en: 'Pending Cases', te: 'పెండింగ్ అభ్యర్థనలు' },
  'adviser.resolvedCases': { en: 'Resolved Cases', te: 'పరిష్కరించిన కేసులు' },
  'adviser.casesList': { en: 'Crop Disease Consultations from Farmers', te: 'రైతుల నుండి వచ్చిన పంట తెగుళ్ల కేసులు' },
  'adviser.respond': { en: 'Provide Advisory', te: 'సలహా ఇవ్వండి' },
  'adviser.farmerName': { en: 'Farmer Name', te: 'రైతు పేరు' },
  'adviser.farmerLocation': { en: 'Farmer Location', te: 'రైతు ప్రాంతం' },
  'adviser.diseaseInput': { en: 'Diagnosed Disease / Pest Name', te: 'గుర్తించిన తెగులు / పురుగు పేరు' },
  'disease.prescriptionPlaceholder': { en: 'Write prescribed chemical/organic spray, dosage, application timing...', te: 'సిఫార్సు చేసిన మందు, మోతాదు, పిచికారీ చేయవలసిన సమయం రాయండి...' },
  'adviser.notesInput': { en: 'Agronomic Guidance & Preventive Measures', te: 'వ్యవసాయ జాగ్రత్తలు & నివారణ చర్యలు' },
  'adviser.submitRemedy': { en: 'Submit Advice & Notify Farmer', te: 'సలహా పంపి రైతుకు తెలియజేయండి' },
  'adviser.specialization': { en: 'Agronomic Specialization', te: 'వ్యవసాయ నైపుణ్యం' },
  'adviser.license': { en: 'License / Reg. Number', te: 'లైసెన్స్ / రిజిస్ట్రేషన్ సంఖ్య' },
  'adviser.tabDisease': { en: 'Crop Disease Consultations', te: 'పంట తెగుళ్ల సలహాలు' },
  'adviser.tabSoil': { en: 'Farmer Support (Soil & Nutrients)', te: 'రైతు మద్దతు (నేల & పోషకాలు)' },
  'adviser.prescribeNutrients': { en: 'Prescribe Nutrients', te: 'పోషకాలను సూచించండి' },
  'adviser.nutrientModalTitle': { en: 'Prescribe Fertilizer & Nutrient Schedule', te: 'ఎరువులు & పోషకాల మోతాదును సూచించండి' },
  'adviser.totalSoilCases': { en: 'Soil Reports', te: 'నేల నివేదికలు' },
  'adviser.soilReportPhoto': { en: 'Soil Test Report Photo', te: 'నేల పరీక్ష నివేదిక ఫోటో' },

  // Farmer Support: Soil & Nutrients
  'support.title': { en: 'Farmer Support: Soil Health & Nutrient Advisory', te: 'రైతు మద్దతు: నేల ఆరోగ్యం & పోషకాల సలహా' },
  'support.subtitle': { en: 'Upload soil test report and select crop/land area to get customized nutrient recommendations, prevent fertilizer over-use, and maximize yield.', te: 'ఎరువుల మితిమీరిన వాడకాన్ని తగ్గించి, అధిక దిగుబడి సాధించేందుకు నేల పరీక్ష నివేదికను అప్‌లోడ్ చేసి నిపుణుల పోషకాల సలహాలు పొందండి.' },
  'support.submitTitle': { en: 'Submit Soil Report for Nutrient Prescription', te: 'పోషకాల సలహా కొరకు నేల నివేదికను పంపండి' },
  'support.landArea': { en: 'Cultivation Land Area', te: 'సాగు విస్తీర్ణం' },
  'support.landAreaPlaceholder': { en: 'e.g., 2.5 Acres, 10 Cents, 1 Hectare', te: 'ఉదా: 2.5 ఎకరాలు, 10 సెంట్లు, 1 హెక్టార్' },
  'support.soilType': { en: 'Soil Type (if known)', te: 'నేల రకం (తెలిసి ఉంటే)' },
  'support.soilPhoto': { en: 'Soil Test Report Photo / Soil Health Card', te: 'నేల పరీక్ష నివేదిక ఫోటో / సాయిల్ హెల్త్ కార్డ్' },
  'support.notes': { en: 'Additional Notes / Previous Crop', te: 'అదనపు వివరాలు / మునుపటి పంట' },
  'support.notesPlaceholder': { en: 'e.g., Previous crop was cotton, soil pH is 7.5, planning for next season...', te: 'ఉదా: మునుపటి పంట పత్తి, నేల pH 7.5, వచ్చే సీజన్ ప్రణాళిక...' },
  'support.submitBtn': { en: 'Request Fertilizer & Nutrient Advice', te: 'ఎరువులు & పోషకాల సలహాను అభ్యర్థించండి' },
  'support.myReports': { en: 'My Soil & Nutrient Consultations', te: 'నా నేల పరీక్ష సలహా అభ్యర్థనలు' },
  'support.noReports': { en: 'No soil reports submitted yet.', te: 'ఇంకా ఎటువంటి నేల నివేదికలు సమర్పించలేదు.' },
  'support.nitrogen': { en: 'Nitrogen (N) Guidance', te: 'నత్రజని (నైట్రోజన్) మోతాదు' },
  'support.phosphorus': { en: 'Phosphorus (P) Guidance', te: 'భాస్వరం (ఫాస్ఫరస్) మోతాదు' },
  'support.potassium': { en: 'Potassium (K) Guidance', te: 'పొటాషియం మోతాదు' },
  'support.micronutrients': { en: 'Micronutrients & Conditioners', te: 'సూక్ష్మ పోషకాలు & నేల మెరుగుదల' },
  'support.organic': { en: 'Organic Manure & Bio-Fertilizers', te: 'సేంద్రీయ ఎరువులు & జీవ ఎరువులు' },
  'support.schedule': { en: 'Fertilizer Application Schedule', te: 'ఎరువులు వేసే సమయ పట్టిక' },
  'support.advised': { en: 'Advice Prescribed', te: 'సలహా ఇవ్వబడింది' },
  'support.pending': { en: 'Under Adviser Analysis', te: 'నిపుణుల విశ్లేషణలో ఉంది' },
  'support.fertilizerPref': { en: 'Fertilizer Preference', te: 'ఎరువుల ప్రాధాన్యత' },
  'support.organicFertilizer': { en: 'Organic Fertilizer', te: 'సేంద్రీయ ఎరువులు (Organic)' },
  'support.chemicalFertilizer': { en: 'Chemical Fertilizer', te: 'రసాయన ఎరువులు (Chemical)' },
  'support.bothFertilizer': { en: 'Integrated (Organic + Chemical)', te: 'సేంద్రీయ & రసాయన రెండూ (Integrated)' },
  'support.fertilizerAdvice': { en: 'Prescribed Fertilizer Advice', te: 'సిఫార్సు చేసిన ఎరువుల సలహా' },
  'adviser.fertilizerAdviceInput': { en: 'Prescribe Fertilizer Advice (Based on Farmer Choice)', te: 'ఎరువుల సిఫార్సు & సలహా (రైతు ఎంపిక ఆధారంగా)' },
  'adviser.farmerDecision': { en: "Farmer's Preference", te: 'రైతు ఎరువుల ప్రాధాన్యత' },

  // Large Scale Consumer
  'bulk.dashTitle': { en: 'Large Scale Consumer Wholesale Portal', te: 'భారీ / టోకు వినియోగదారు పోర్టల్' },
  'bulk.badge': { en: 'Wholesale / Bulk Buyer', te: 'టోకు / భారీ కొనుగోలుదారు' },
  'bulk.minNotice': { en: 'Minimum order ₹500. Bulk orders must be collected directly from the FarmDirect Hub.', te: 'కనీస ఆర్డర్ ₹500. భారీ ఆర్డర్లను నేరుగా ఫార్మ్‌డైరెక్ట్ హబ్ వద్దనే తీసుకోవాలి.' },
  'bulk.noLimitNotice': { en: 'No quantity limits! Order in bulk directly from verified farmers.', te: 'పరిమాణంపై ఎటువంటి పరిమితులు లేవు! రైతుల నుండి నేరుగా భారీగా ఆర్డర్ చేయండి.' },
  'bulk.businessName': { en: 'Business / Organization Name', te: 'వ్యాపారం / సంస్థ పేరు' },

  // Consumer Orders
  'orders.myOrders': { en: 'My Orders', te: 'నా ఆర్డర్లు' },
  'orders.all': { en: 'All', te: 'అన్నీ' },
  'orders.active': { en: 'Active', te: 'క్రియాశీలకం' },
  'orders.completed': { en: 'Completed', te: 'పూర్తయినవి' },
  'orders.cancelled': { en: 'Cancelled', te: 'రద్దు చేయబడినవి' },
  'orders.noOrders': { en: 'No orders found', te: 'ఎటువంటి ఆర్డర్లు లేవు' },
  'orders.noOrdersDesc': { en: "You haven't placed any orders yet.", te: 'మీరు ఇంకా ఎటువంటి ఆర్డర్లు చేయలేదు.' },
  'orders.totalAmount': { en: 'Total Amount', te: 'మొత్తం ధర' },
  'orders.viewDetails': { en: 'View Details & Track', te: 'వివరాలు & ట్రాకింగ్ చూడండి' },
  'orders.moreItems': { en: 'more items', te: 'మరిన్ని ఉత్పత్తులు' },

  // Farmer Portal & Add Produce
  'farmer.dashTitle': { en: 'Farmer Dashboard', te: 'రైతు డ్యాష్‌బోర్డ్' },
  'farmer.welcomeBack': { en: 'Welcome back', te: 'స్వాగతం' },
  'farmer.activeListings': { en: 'Active Listings', te: 'జాబితా చేసిన పంటలు' },
  'farmer.totalProduce': { en: 'Total Produce', te: 'మొత్తం పంటలు' },
  'farmer.totalStock': { en: 'Total Stock in Hand', te: 'అందుబాటులో ఉన్న మొత్తం స్టాక్' },
  'farmer.availableStock': { en: 'Available Stock', te: 'అందుబాటులో ఉన్న స్టాక్' },
  'farmer.ordersReceived': { en: 'Orders Received', te: 'వచ్చిన ఆర్డర్లు' },
  'farmer.completedOrders': { en: 'Completed Orders', te: 'పూర్తయిన ఆర్డర్లు' },
  'farmer.totalEarnings': { en: 'Total Earnings', te: 'మొత్తం సంపాదన' },
  'farmer.recentOrders': { en: 'Recent Orders', te: 'ఇటీవలి ఆర్డర్లు' },
  'farmer.noRecentOrders': { en: 'No recent orders', te: 'ఇటీవలి ఆర్డర్లు ఏవీ లేవు' },
  'farmer.noRecentOrdersDesc': { en: 'When customers buy your produce, orders will appear here.', te: 'కస్టమర్లు మీ పంటను కొనుగోలు చేసినప్పుడు, ఆర్డర్లు ఇక్కడ కనిపిస్తాయి.' },
  'farmer.myProduce': { en: 'My Produce', te: 'నా పంటలు' },
  'farmer.manageProduce': { en: 'Manage your listed vegetables', te: 'మీరు నమోదు చేసిన కూరగాయలను నిర్వహించండి' },
  'farmer.addNewProduce': { en: 'Add New Produce', te: 'కొత్త పంటను జోడించండి' },
  'farmer.noProduceListed': { en: "You haven't listed any produce yet", te: 'మీరు ఇంకా ఏ పంటనూ జాబితా చేయలేదు' },
  'farmer.noProduceListedDesc': { en: 'Start by adding your first harvest! It will be visible to consumers looking for fresh vegetables.', te: 'మీ మొదటి పంటను జోడించడం ద్వారా ప్రారంభించండి! ఇది తాజా కూరగాయల కోసం చూస్తున్న వినియోగదారులకు కనిపిస్తుంది.' },
  'farmer.addProduceTitle': { en: 'List New Produce', te: 'కొత్త పంటను జాబితా చేయండి' },
  'farmer.selectVeg': { en: 'Select Vegetable', te: 'కూరగాయను ఎంచుకోండి' },
  'farmer.quantity': { en: 'Available Quantity', te: 'అందుబాటులో ఉన్న పరిమాణం' },
  'farmer.availableQty': { en: 'Available Qty:', te: 'అందుబాటులో ఉన్న పరిమాణం:' },
  'farmer.yourPrice': { en: 'Your Earning Price', te: 'మీ సంపాదన ధర' },
  'farmer.yourPriceLabel': { en: 'Your Earning Price:', te: 'మీ సంపాదన ధర:' },
  'farmer.yourPriceParen': { en: '(Your Price)', te: '(మీ ధర)' },
  'farmer.marginNote': { en: 'Includes 15% platform/admin margin.', te: '15% ప్లాట్‌ఫారమ్ మార్జిన్ మినహాయించబడింది.' },
  'farmer.estValue': { en: 'Estimated Total Value', te: 'అంచనా మొత్తం విలువ' },
  'farmer.estValueLabel': { en: 'Est. Value:', te: 'అంచనా విలువ:' },
  'farmer.farmName': { en: 'Farm Name', te: 'పొలం / ఫామ్ పేరు' },
  'farmer.farmPlaceName': { en: 'Farm/Place Name', te: 'పొలం / ఫామ్ పేరు' },
  'farmer.farmLocation': { en: 'Farm Location / Village', te: 'పొలం ఉన్న ప్రాంతం / గ్రామం' },
  'farmer.village': { en: 'Village/City', te: 'గ్రామం / నగరం' },
  'farmer.district': { en: 'District', te: 'జిల్లా' },
  'farmer.state': { en: 'State', te: 'రాష్ట్రం' },
  'farmer.pincode': { en: 'Pincode', te: 'పిన్‌కోడ్' },
  'farmer.uploadImages': { en: 'Upload Crop Photos', te: 'పంట ఫోటోలను అప్‌లోడ్ చేయండి' },
  'farmer.uploadPhotosTitle': { en: 'Upload Photos', te: 'ఫోటోలను అప్‌లోడ్ చేయండి' },
  'farmer.uploadPhotosDesc': { en: 'Add clear photos of your crop to attract buyers', te: 'కొనుగోలుదారులను ఆకర్షించడానికి మీ పంట స్పష్టమైన ఫోటోలను చేర్చండి' },
  'farmer.uploadPhotosLimit': { en: 'Upload up to 5 photos (Optional but recommended)', te: 'గరిష్టంగా 5 ఫోటోల వరకు అప్‌లోడ్ చేయవచ్చు (ఐచ్ఛికం)' },
  'farmer.reviewTitle': { en: 'Review & Submit', te: 'సమీక్షించి సమర్పించండి' },
  'farmer.reviewDesc': { en: 'Please verify all details before submitting', te: 'సమర్పించే ముందు అన్ని వివరాలను ఒకసారి తనిఖీ చేసుకోండి' },
  'farmer.noPhotos': { en: 'No photos added', te: 'ఫోటోలు చేర్చలేదు' },
  'farmer.submitProduce': { en: 'Submit Produce', te: 'పంటను నమోదు చేయండి' },
  'farmer.updateQuantity': { en: 'Update Quantity', te: 'పరిమాణాన్ని మార్చండి' },
  'farmer.editQty': { en: 'Edit Qty', te: 'పరిమాణాన్ని సవరించండి' },
  'farmer.deleteProduce': { en: 'Remove Listing', te: 'పంటను తొలగించండి' },
  'farmer.removeConfirm': { en: 'Are you sure you want to remove this produce from your listings? This action cannot be undone.', te: 'మీరు మీ జాబితా నుండి ఈ పంటను ఖచ్చితంగా తొలగించాలనుకుంటున్నారా? ఈ చర్యను రద్దు చేయలేరు.' },
  'farmer.save': { en: 'Save Changes', te: 'మార్పులను భద్రపరచండి' },
  'farmer.cancel': { en: 'Cancel', te: 'రద్దు చేయండి' },
  'farmer.listedOn': { en: 'Listed on:', te: 'జాబితా చేసిన తేదీ:' },
  'farmer.produce': { en: 'Produce', te: 'పంట' },
  'farmer.date': { en: 'Date', te: 'తేదీ' },

  // Statuses
  'status.ACTIVE': { en: 'Active', te: 'అందుబాటులో ఉంది' },
  'status.INACTIVE': { en: 'Inactive', te: 'నిలిపివేయబడింది' },
  'status.SOLDOUT': { en: 'Sold Out', te: 'స్టాక్ అయిపోయింది' },
  'status.PLACED': { en: 'Placed', te: 'ఆర్డర్ చేసారు' },
  'status.PENDING': { en: 'Pending', te: 'పెండింగ్' },
  'status.PROCESSING': { en: 'Processing', te: 'ప్రాసెసింగ్' },
  'status.CONFIRMED': { en: 'Confirmed', te: 'నిర్ధారించబడింది' },
  'status.ASSIGNED': { en: 'Assigned to Coordinator', te: 'సమన్వయకర్తకు కేటాయించబడింది' },
  'status.PICKUP': { en: 'Picked Up from Farm', te: 'పొలం నుండి తీసుకున్నారు' },
  'status.OUT_FOR_DELIVERY': { en: 'Out for Delivery', te: 'డెలివరీకి బయలుదేరింది' },
  'status.DELIVERED': { en: 'Delivered', te: 'డెలివరీ పూర్తయింది' },
  'status.CANCELLED': { en: 'Cancelled', te: 'రద్దు చేయబడింది' },

  // Auth & Landing
  'auth.welcome': { en: 'Welcome to FarmDirect Hub', te: 'ఫార్మ్‌డైరెక్ట్ హబ్‌కి స్వాగతం' },
  'auth.subtitle': { en: 'Empowering farmers with fair mandated prices & connecting consumers directly with fresh harvest.', te: 'రైతులకు గిట్టుబాటు ధరను అందిస్తూ, వినియోగదారులకు నేరుగా తాజా కూరగాయలను చేరవేస్తుంది.' },
  'auth.login': { en: 'Sign In', te: 'లాగిన్ చేయండి' },
  'auth.selectRole': { en: 'Select Your Role', te: 'మీ పాత్రను ఎంచుకోండి' },
  'auth.username': { en: 'Username', te: 'వినియోగదారు పేరు' },
  'auth.password': { en: 'Password', te: 'పాస్‌వర్డ్' },
  'auth.remember': { en: 'Remember me', te: 'నన్ను గుర్తుంచుకోండి' },
  'auth.noAccount': { en: "Don't have an account?", te: 'ఇంకా ఖాతా లేదా?' },
  'auth.register': { en: 'Register Now', te: 'ఇప్పుడే నమోదు చేసుకోండి' },
  'auth.demoTitle': { en: 'Quick Demo Login:', te: 'త్వరిత డెమో లాగిన్:' },

  // Admin Portal
  'admin.dashTitle': { en: 'Admin Dashboard', te: 'నిర్వాహక డ్యాష్‌బోర్డ్' },
  'admin.priceManagement': { en: 'Vegetable Price Management', te: 'కూరగాయల ధరల నిర్వహణ' },
  'admin.priceControlDesc': { en: 'Control prices for all vegetables in the marketplace', te: 'మార్కెట్‌లో అన్ని కూరగాయల ధరలను నియంత్రించండి' },
  'admin.addVegetable': { en: 'Add New Vegetable', te: 'కొత్త కూరగాయను చేర్చండి' },
  'admin.editVegetable': { en: 'Edit Vegetable', te: 'కూరగాయను సవరించండి' },
  'admin.vegetableName': { en: 'Vegetable Name', te: 'కూరగాయ పేరు' },
  'admin.updatePrice': { en: 'Update Price', te: 'ధరను మార్చండి' },
  'admin.currentPrice': { en: 'Current Price (₹)', te: 'ప్రస్తుత ధర (₹)' },
  'admin.unit': { en: 'Unit', te: 'కొలమానం' },
  'admin.lastUpdated': { en: 'Last Updated', te: 'చివరిగా నవీకరించబడింది' },
  'admin.status': { en: 'Status', te: 'స్థితి' },
  'admin.actions': { en: 'Actions', te: 'చర్యలు' },
  'admin.totalFarmers': { en: 'Total Farmers', te: 'మొత్తం రైతులు' },
  'admin.totalConsumers': { en: 'Total Consumers', te: 'మొత్తం వినియోగదారులు' },
  'admin.totalCoordinators': { en: 'Total Coordinators', te: 'మొత్తం సమన్వయకర్తలు' },
  'admin.totalProducts': { en: 'Total Products', te: 'మొత్తం ఉత్పత్తులు' },
  'admin.totalOrders': { en: 'Total Orders', te: 'మొత్తం ఆర్డర్లు' },
  'admin.pendingOrders': { en: 'Pending Orders', te: 'పెండింగ్ ఆర్డర్లు' },
  'admin.completedOrders': { en: 'Completed Orders', te: 'పూర్తయిన ఆర్డర్లు' },
  'admin.totalSales': { en: 'Total Sales', te: 'మొత్తం అమ్మకాలు' },
  'admin.recentOrders': { en: 'Recent Orders', te: 'ఇటీవలి ఆర్డర్లు' },
  'admin.topVegetables': { en: 'Top Selling Vegetables', te: 'అత్యధికంగా అమ్ముడైన కూరగాయలు' },
  'admin.verifyFarmer': { en: 'Verify Farmer', te: 'రైతును ధృవీకరించండి' },

  // Coordinator Portal
  'coord.dashTitle': { en: 'Hub Coordinator Dashboard', te: 'హబ్ సమన్వయకర్త డ్యాష్‌బోర్డ్' },
  'coord.preBooked': { en: 'Pre-Booked Orders', te: 'ముందస్తు బుకింగ్ ఆర్డర్లు' },
  'coord.allOrders': { en: 'All Orders', te: 'అన్ని ఆర్డర్లు' },
  'coord.new': { en: 'New', te: 'కొత్తది' },
  'coord.inTransit': { en: 'In Transit', te: 'ప్రయాణంలో ఉంది' },
  'coord.delivered': { en: 'Delivered', te: 'డెలివరీ పూర్తయింది' },
  'coord.orderNum': { en: 'Order #', te: 'ఆర్డర్ సంఖ్య' },
  'coord.items': { en: 'Items', te: 'ఉత్పత్తులు' },
  'coord.consumer': { en: 'Consumer', te: 'వినియోగదారుడు' },
  'coord.amount': { en: 'Amount', te: 'మొత్తం' },
  'coord.status': { en: 'Status', te: 'స్థితి' },
  'coord.date': { en: 'Date', te: 'తేదీ' },
  'coord.actions': { en: 'Actions', te: 'చర్యలు' },
  'coord.noOrders': { en: 'No orders found', te: 'ఎటువంటి ఆర్డర్లు లేవు' },
  'coord.noOrdersDesc': { en: 'Orders matching this filter will appear here.', te: 'ఈ ఫిల్టర్‌కు తగిన ఆర్డర్లు ఇక్కడ కనిపిస్తాయి.' },
  'coord.manageDeliveries': { en: 'Manage Deliveries & Pickups', te: 'సేకరణ మరియు డెలివరీల నిర్వహణ' },
  'coord.updateStatus': { en: 'Update Delivery Status', te: 'డెలివరీ స్థితిని మార్చండి' },

  // Registration Portal
  'reg.joinTitle': { en: 'Join FarmDirect Hub', te: 'ఫార్మ్‌డైరెక్ట్ హబ్‌లో చేరండి' },
  'reg.joinSubtitle': { en: 'Choose your role to get started and be part of the agricultural revolution.', te: 'ప్రారంభించడానికి మీ పాత్రను ఎంచుకోండి మరియు నూతన వ్యవసాయ మార్కెట్‌లో భాగస్వామ్యం అవ్వండి.' },
  'reg.farmerDesc': { en: 'List your produce and sell directly to consumers at fair prices.', te: 'మీ పంటను నమోదు చేయండి మరియు నేరుగా వినియోగదారులకు గిట్టుబాటు ధరకు విక్రయించండి.' },
  'reg.consumerDesc': { en: 'Buy fresh, quality produce directly from verified local farmers.', te: 'ధృవీకరించబడిన స్థానిక రైతుల నుండి నేరుగా తాజా, నాణ్యమైన కూరగాయలను కొనండి.' },
  'reg.coordinatorDesc': { en: 'Help coordinate deliveries between farmers and consumers efficiently.', te: 'రైతులు మరియు వినియోగదారుల మధ్య పంట సేకరణ & డెలివరీలను సమన్వయం చేయండి.' },
  'reg.asFarmer': { en: 'Register as Farmer', te: 'రైతుగా నమోదు చేసుకోండి' },
  'reg.asConsumer': { en: 'Register as Consumer', te: 'వినియోగదారునిగా నమోదు చేసుకోండి' },
  'reg.asCoordinator': { en: 'Register as Coordinator', te: 'సమన్వయకర్తగా నమోదు చేసుకోండి' },
  'reg.haveAccount': { en: 'Already have an account?', te: 'ఇప్పటికే ఖాతా ఉందా?' },
  'reg.loginHere': { en: 'Login here', te: 'ఇక్కడ లాగిన్ అవ్వండి' },
  'reg.consumerTitle': { en: 'Consumer Registration', te: 'వినియోగదారుని నమోదు' },
  'reg.consumerSubtitle': { en: 'Create your account to buy fresh produce directly from farmers', te: 'రైతుల నుండి నేరుగా తాజా కూరగాయలను కొనుగోలు చేయడానికి మీ ఖాతాను సృష్టించండి' },
  'reg.farmerTitle': { en: 'Farmer Registration', te: 'రైతు నమోదు' },
  'reg.farmerSubtitle': { en: 'Create your farmer account to start selling directly to consumers', te: 'వినియోగదారులకు నేరుగా అమ్మకాలు ప్రారంభించడానికి మీ రైతు ఖాతాను సృష్టించండి' },
  'reg.coordinatorTitle': { en: 'Coordinator Registration', te: 'సమన్వయకర్త నమోదు' },
  'reg.coordinatorSubtitle': { en: 'Join as a coordinator to help deliver fresh produce', te: 'తాజా కూరగాయల డెలివరీకి సహాయపడటానికి సమన్వయకర్తగా చేరండి' },
  'reg.personalInfo': { en: 'Personal Information', te: 'వ్యక్తిగత వివరాలు' },
  'reg.fullName': { en: 'Full Name', te: 'పూర్తి పేరు' },
  'reg.username': { en: 'Username', te: 'వినియోగదారు పేరు' },
  'reg.mobileNumber': { en: 'Mobile Number', te: 'మొబైల్ నంబర్' },
  'reg.mobilePlaceholder': { en: '10-digit number', te: '10 అంకెల మొబైల్ నంబర్' },
  'reg.email': { en: 'Email Address', te: 'ఈమెయిల్ చిరునామా' },
  'reg.password': { en: 'Password', te: 'పాస్‌వర్డ్' },
  'reg.confirmPassword': { en: 'Confirm Password', te: 'పాస్‌వర్డ్‌ను నిర్ధారించండి' },
  'reg.address': { en: 'Address', te: 'చిరునామా' },
  'reg.streetAddress': { en: 'Street Address', te: 'వీధి / ఇంటి నంబర్' },
  'reg.village': { en: 'Village / Location', te: 'గ్రామం / ప్రాంతం' },
  'reg.city': { en: 'City / Location', te: 'నగరం / ప్రాంతం' },
  'reg.location': { en: 'Location / Area', te: 'ప్రాంతం / ఏరియా' },
  'reg.district': { en: 'District', te: 'జిల్లా' },
  'reg.state': { en: 'State', te: 'రాష్ట్రం' },
  'reg.selectState': { en: 'Select State', te: 'రాష్ట్రాన్ని ఎంచుకోండి' },
  'reg.pincode': { en: 'Pincode', te: 'పిన్‌కోడ్' },
  'reg.pincodePlaceholder': { en: '6-digit PIN', te: '6 అంకెల పిన్‌కోడ్' },
  'reg.farmDetails': { en: 'Farm Details', te: 'పొలం వివరాలు' },
  'reg.farmName': { en: 'Farm Name', te: 'పొలం / ఫామ్ పేరు' },
  'reg.farmNamePlaceholder': { en: 'e.g., Sri Sai Farms', te: 'ఉదా: శ్రీ సాయి ఫార్మ్స్' },
  'reg.farmType': { en: 'Farm Type', te: 'వ్యవసాయ రకం' },
  'reg.selectFarmType': { en: 'Select Farm Type', te: 'వ్యవసాయ రకాన్ని ఎంచుకోండి' },
  'reg.farmTypeMixed': { en: 'Mixed Farming', te: 'మిశ్రమ వ్యవసాయం' },
  'reg.farmTypeOrganic': { en: 'Organic', te: 'సేంద్రీయ వ్యవసాయం' },
  'reg.farmTypeTraditional': { en: 'Traditional', te: 'సాంప్రదాయ వ్యవసాయం' },
  'reg.farmTypeHorticulture': { en: 'Horticulture', te: 'ఉద్యానవన పంటలు' },
  'reg.bankDetails': { en: 'Bank Account Details', te: 'బ్యాంక్ ఖాతా వివరాలు' },
  'reg.bankName': { en: 'Bank Name', te: 'బ్యాంక్ పేరు' },
  'reg.accountNumber': { en: 'Account Number', te: 'ఖాతా సంఖ్య' },
  'reg.ifscCode': { en: 'IFSC Code', te: 'IFSC కోడ్' },
  'reg.accountHolderName': { en: 'Account Holder Name', te: 'ఖాతాదారుని పేరు' },
  'reg.createAccount': { en: 'Create Account', te: 'ఖాతాను సృష్టించండి' },
  'reg.passwordsMismatch': { en: "Passwords don't match", te: 'పాస్‌వర్డ్‌లు సరిపోలడం లేదు' },
  'reg.passwordLength': { en: 'Password must be at least 6 characters', te: 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి' },
  'reg.validMobile': { en: 'Please enter a valid 10-digit mobile number', te: 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి' },
  'reg.regSuccess': { en: 'Registration successful! Please login.', te: 'నమోదు విజయవంతమైంది! దయచేసి లాగిన్ చేయండి.' },
  'reg.regFailed': { en: 'Registration failed. Please try again.', te: 'నమోదు విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.' },
  'reg.home': { en: 'Home', te: 'హోమ్' },
  'reg.register': { en: 'Register', te: 'నమోదు' },
};

const vegTranslations: Record<string, string> = {
  'tomatoes': 'టమాటాలు',
  'tomato': 'టమాటా',
  'ladies finger': 'బెండకాయ',
  'cucumbers': 'దోసకాయలు',
  'cucumber': 'దోసకాయ',
  'spinach': 'పాలకూర',
  'bottle gourd': 'సొరకాయ',
  'carrots': 'క్యారెట్లు',
  'carrot': 'క్యారెట్',
  'brinjal': 'వంకాయ',
  'ridge gourd': 'బీరకాయ',
  'bitter gourd': 'కాకరకాయ',
  'tindora': 'దొండకాయ',
  'cauliflower': 'క్యాలీఫ్లవర్',
  'beans': 'చిక్కుడుకాయలు',
  'drumstick': 'మునగకాయలు',
  'potatoes': 'బంగాళాదుంపలు',
  'potato': 'బంగాళాదుంప',
  'onions': 'ఉల్లిపాయలు',
  'onion': 'ఉల్లిపాయ',
  'cabbage': 'క్యాబేజీ',
  'green chilli': 'పచ్చిమిర్చి',
  'green chillies': 'పచ్చిమిర్చి',
  'ginger': 'అల్లం',
  'garlic': 'వెల్లుల్లి',
  'coriander': 'కొత్తిమీర',
  'mint': 'పుదీనా',
  'capsicum': 'క్యాప్సికం',
  'radish': 'ముల్లంగి',
  'beetroot': 'బీట్‌రూట్',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('fdh_language');
    return (saved === 'te' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('fdh_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'te' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en || fallback || key;
    }
    return fallback || key;
  };

  const translateVeg = (name: string): string => {
    if (!name) return '';
    if (language === 'en') return name;
    
    const key = `veg.${name}`;
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }

    const cleanLower = name.trim().toLowerCase();
    if (vegTranslations[cleanLower]) {
      return vegTranslations[cleanLower];
    }

    return name;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, translateVeg }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
