import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

export const translations = {
  en: {
    // Tab Bar
    tab_home: "Home",
    tab_villages: "Villages",
    tab_search: "Search",
    tab_profile: "Profile",

    // Home Screen
    app_title: "Vishwakarma Kutumb",
    app_subtitle: "Directory of our heritage",
    stat_villages: "Villages",
    stat_families: "Families",
    stat_members: "Members",
    section_quick_actions: "Quick Actions",
    section_recently_added: "Recently Added Families",
    btn_see_all: "See All →",
    action_dashboard: "Dashboard",
    action_manage: "Manage",
    action_add_family: "Add Family",
    action_admin_login: "Admin Login",

    // Villages Screen
    villages_title: "Villages Directory",
    villages_search_placeholder: "Search village...",
    villages_count: "villages in the directory",
    no_villages_found: "No villages found",

    // Search Screen
    search_title: "Global Search",
    search_placeholder: "Search by name, gotra, business...",
    search_hints_title: "Search Hints",
    search_hint_gotra: "Search gotra like 'Suthar', 'Chauhan' etc.",
    search_hint_village: "Search by village name to view its list.",
    search_hint_business: "Find people by profession (e.g. 'Business', 'Farmer').",
    search_no_results: "No results found",
    search_initial_state: "Search for members by name, gotra, business, or village",

    // Profile Screen
    profile_title: "My Profile",
    role_guest: "Guest Profile",
    role_super_admin: "Super Admin",
    role_village_admin: "Village Admin",
    label_language: "Language Settings",
    lang_en: "English",
    lang_hi: "Hindi (हिंदी)",
    btn_login: "Login as Admin",
    btn_logout: "Logout",
    dashboard_super: "Super Admin Dashboard",
    dashboard_village: "Village Admin Dashboard",
    section_about: "About App",
    about_version: "Version 1.0.0",
    about_developer: "Developer Info",

    // Login Screen
    login_title: "Admin Login",
    login_subtitle: "Enter your credentials to access admin tools",
    login_label_email: "Email Address",
    login_label_password: "Password",
    login_placeholder_email: "Enter admin email",
    login_placeholder_password: "Enter password",
    login_btn_signin: "Sign In",
    login_btn_signing_in: "Signing In...",

    // Village Details Screen
    village_search_families: "Search families...",
    village_label_gotra: "Gotra",
    village_label_head: "Head",
    village_no_families: "No families found in this village",

    // Add Family Form
    form_add_family_title: "Add New Family",
    form_head_details: "Head of Family Details",
    form_label_name: "Full Name",
    form_label_gotra: "Gotra / Surname",
    form_label_occupation: "Occupation / Profession",
    form_label_phone: "Phone Number",
    form_placeholder_name: "Enter full name",
    form_placeholder_gotra: "Enter gotra / surname",
    form_placeholder_occupation: "Enter occupation",
    form_placeholder_phone: "Enter 10-digit number",
    form_btn_submit: "Submit",
    form_submitting: "Submitting...",

    // Family Details Screen
    family_details_title: "Family Details",
    family_head: "Head of Family",
    family_section_members: "Members",
    family_btn_add_member: "Add Member",
    family_label_relation: "Relationship",
    family_label_age: "Age",
  },
  hi: {
    // Tab Bar
    tab_home: "होम",
    tab_villages: "गाँव",
    tab_search: "खोजें",
    tab_profile: "प्रोफाइल",

    // Home Screen
    app_title: "विश्वकर्मा कुटुंब",
    app_subtitle: "हमारी धरोहर की निर्देशिका",
    stat_villages: "कुल गाँव",
    stat_families: "कुल परिवार",
    stat_members: "कुल सदस्य",
    section_quick_actions: "त्वरित विकल्प",
    section_recently_added: "हाल ही में जुड़े परिवार",
    btn_see_all: "सभी देखें →",
    action_dashboard: "डैशबोर्ड",
    action_manage: "प्रबंधन",
    action_add_family: "परिवार जोड़ें",
    action_admin_login: "एडमिन लॉगिन",

    // Villages Screen
    villages_title: "गाँव निर्देशिका",
    villages_search_placeholder: "गाँव खोजें...",
    villages_count: "निर्देशिका में गाँव उपलब्ध हैं",
    no_villages_found: "कोई गाँव नहीं मिला",

    // Search Screen
    search_title: "वैश्विक खोज",
    search_placeholder: "नाम, गोत्र, व्यवसाय से खोजें...",
    search_hints_title: "खोज के संकेत",
    search_hint_gotra: "गोत्र जैसे 'सुथार', 'चौहान' आदि खोजें।",
    search_hint_village: "सूची देखने के लिए गाँव के नाम से खोजें।",
    search_hint_business: "व्यवसाय द्वारा लोग खोजें (जैसे 'व्यापार', 'किसान')।",
    search_no_results: "कोई परिणाम नहीं मिला",
    search_initial_state: "नाम, गोत्र, व्यवसाय या गाँव से सदस्यों को खोजें",

    // Profile Screen
    profile_title: "मेरी प्रोफ़ाइल",
    role_guest: "अतिथि प्रोफ़ाइल",
    role_super_admin: "सुपर एडमिन",
    role_village_admin: "गाँव एडमिन",
    label_language: "भाषा सेटिंग्स",
    lang_en: "English",
    lang_hi: "Hindi (हिंदी)",
    btn_login: "एडमिन लॉगिन",
    btn_logout: "लॉगआउट",
    dashboard_super: "सुपर एडमिन डैशबोर्ड",
    dashboard_village: "गाँव एडमिन डैशबोर्ड",
    section_about: "ऐप के बारे में",
    about_version: "संस्करण 1.0.0",
    about_developer: "डेवलपर जानकारी",

    // Login Screen
    login_title: "एडमिन लॉगिन",
    login_subtitle: "एडमिन टूल्स तक पहुँचने के लिए क्रेडेंशियल दर्ज करें",
    login_label_email: "ईमेल पता",
    login_label_password: "पासवर्ड",
    login_placeholder_email: "एडमिन ईमेल दर्ज करें",
    login_placeholder_password: "पासवर्ड दर्ज करें",
    login_btn_signin: "साइन इन करें",
    login_btn_signing_in: "साइन इन हो रहा है...",

    // Village Details Screen
    village_search_families: "परिवार खोजें...",
    village_label_gotra: "गोत्र",
    village_label_head: "मुखिया",
    village_no_families: "इस गाँव में कोई परिवार नहीं मिला",

    // Add Family Form
    form_add_family_title: "नया परिवार जोड़ें",
    form_head_details: "परिवार के मुखिया का विवरण",
    form_label_name: "पूरा नाम",
    form_label_gotra: "गोत्र / उपनाम",
    form_label_occupation: "व्यवसाय / पेशा",
    form_label_phone: "फ़ोन नंबर",
    form_placeholder_name: "पूरा नाम दर्ज करें",
    form_placeholder_gotra: "गोत्र दर्ज करें",
    form_placeholder_occupation: "व्यवसाय दर्ज करें",
    form_placeholder_phone: "10-डिजिट नंबर दर्ज करें",
    form_btn_submit: "जमा करें",
    form_submitting: "जमा हो रहा है...",

    // Family Details Screen
    family_details_title: "परिवार विवरण",
    family_head: "परिवार का मुखिया",
    family_section_members: "सदस्यगण",
    family_btn_add_member: "सदस्य जोड़ें",
    family_label_relation: "संबंध",
    family_label_age: "उम्र",
  }
};

const i18n = new I18n(translations);
i18n.enableFallback = true;

// Detect device language initially
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLanguage === 'hi' ? 'hi' : 'en';

export default i18n;
