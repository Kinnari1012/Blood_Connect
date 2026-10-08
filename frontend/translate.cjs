const fs = require('fs');
const files = ['en', 'gu', 'hi'];
const translations = {
  en: {
    overviewMsg: 'Here is the latest update on blood requests and donations.',
    trendMonth: '+12% this month',
    trendToday: '+5% today',
    resolvedToday: '24 resolved today',
    criticalPriority: 'Critical Priority',
    donationActivity: 'Donation Activity (Last 6 Months)',
    viewAll: 'View All',
    patient: 'Patient',
    group: 'Group',
    hospitalLocation: 'Hospital & Location',
    date: 'Date',
    status: 'Status',
    noRecent: 'No recent requests found.',
    emergencyPriority: 'Emergency Priority',
    critical: 'Critical',
    units: 'Units',
    respondNow: 'Respond Now',
    noEmergency: 'No emergency requests active.',
    availableDonors: 'Available Donors Near You',
    searchDirectory: 'Search Directory',
    last: 'Last:',
    available: 'Available',
    unavailable: 'Unavailable',
    viewProfile: 'View Profile',
    inProgress: 'In Progress'
  },
  gu: {
    overviewMsg: 'અહીં રક્ત વિનંતીઓ અને દાન પર નવીનતમ અપડેટ છે.',
    trendMonth: '+૧૨% આ મહિને',
    trendToday: '+૫% આજે',
    resolvedToday: '૨૪ આજે ઉકેલાયા',
    criticalPriority: 'જટિલ પ્રાધાન્યતા',
    donationActivity: 'દાન પ્રવૃત્તિ (છેલ્લા 6 મહિના)',
    viewAll: 'બધા જુઓ',
    patient: 'દર્દી',
    group: 'ગ્રુપ',
    hospitalLocation: 'હોસ્પિટલ અને સ્થાન',
    date: 'તારીખ',
    status: 'સ્થિતિ',
    noRecent: 'કોઈ તાજેતરની વિનંતીઓ મળી નથી.',
    emergencyPriority: 'ઇમરજન્સી પ્રાધાન્યતા',
    critical: 'જટિલ',
    units: 'યુનિટ્સ',
    respondNow: 'હવે જવાબ આપો',
    noEmergency: 'કોઈ ઇમરજન્સી વિનંતી સક્રિય નથી.',
    availableDonors: 'તમારી નજીક ઉપલબ્ધ દાતાઓ',
    searchDirectory: 'ડિરેક્ટરી શોધો',
    last: 'છેલ્લે:',
    available: 'ઉપલબ્ધ',
    unavailable: 'અનુપલબ્ધ',
    viewProfile: 'પ્રોફાઇલ જુઓ',
    inProgress: 'પ્રગતિમાં છે'
  },
  hi: {
    overviewMsg: 'यहाँ रक्त अनुरोधों और दान पर नवीनतम अपडेट है।',
    trendMonth: '+12% इस महीने',
    trendToday: '+5% आज',
    resolvedToday: '24 आज हल हुए',
    criticalPriority: 'गंभीर प्राथमिकता',
    donationActivity: 'दान गतिविधि (पिछले 6 महीने)',
    viewAll: 'सभी देखें',
    patient: 'मरीज',
    group: 'समूह',
    hospitalLocation: 'अस्पताल और स्थान',
    date: 'तारीख',
    status: 'स्थिति',
    noRecent: 'कोई हालिया अनुरोध नहीं मिला।',
    emergencyPriority: 'आपातकालीन प्राथमिकता',
    critical: 'गंभीर',
    units: 'यूनिट्स',
    respondNow: 'अभी उत्तर दें',
    noEmergency: 'कोई आपातकालीन अनुरोध सक्रिय नहीं है।',
    availableDonors: 'आपके आस-पास उपलब्ध रक्तदाता',
    searchDirectory: 'निर्देशिका खोजें',
    last: 'अंतिम:',
    available: 'उपलब्ध',
    unavailable: 'अनुपलब्ध',
    viewProfile: 'प्रोफ़ाइल देखें',
    inProgress: 'प्रगति पर है'
  }
};

files.forEach(lang => {
  const path = `src/i18n/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.dashboard = { ...data.dashboard, ...translations[lang] };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
});
console.log('Translations updated.');
