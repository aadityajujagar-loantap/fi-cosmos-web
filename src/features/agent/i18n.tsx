/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

type Language = "en" | "hi" | "mr";

interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

interface I18nContextValue {
  language: Language;
  languages: LanguageOption[];
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}

const STORAGE_KEY = "agent-language";

export const languageOptions: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
];

const hi: Record<string, string> = {
  "About FieldOps": "FieldOps के बारे में",
  "Accept Case": "केस स्वीकार करें",
  "Account Security": "खाता सुरक्षा",
  "Accurate to 10 meters": "10 मीटर तक सटीक",
  "Activity Status": "गतिविधि स्थिति",
  "Add Document": "दस्तावेज़ जोड़ें",
  "Add More": "और जोड़ें",
  "Add Task": "कार्य जोड़ें",
  "Address": "पता",
  "Agent App": "एजेंट ऐप",
  "Alerts and reminder settings": "अलर्ट और रिमाइंडर सेटिंग",
  "Alerts for document uploads and verifications": "दस्तावेज़ अपलोड और सत्यापन अलर्ट",
  "Alerts for task assignment, updates and changes": "कार्य असाइनमेंट, अपडेट और बदलाव के अलर्ट",
  "All": "सभी",
  "All Logs": "सभी लॉग",
  "Allow app to access your location": "ऐप को आपका स्थान एक्सेस करने दें",
  "Allow app to sync in the background": "ऐप को बैकग्राउंड में सिंक करने दें",
  "Announcements": "घोषणाएं",
  "App Information": "ऐप जानकारी",
  "App Permissions": "ऐप अनुमतियां",
  "App version and information": "ऐप संस्करण और जानकारी",
  "App version, policies and diagnostics": "ऐप संस्करण, नीतियां और डायग्नोस्टिक्स",
  "Approximate Stay Duration": "अनुमानित रहने की अवधि",
  "Ask the customer to sign in the box above.": "ग्राहक से ऊपर दिए बॉक्स में हस्ताक्षर करवाएं।",
  "Assigned, pending and completed work": "असाइन, लंबित और पूर्ण कार्य",
  "Auto Sync": "ऑटो सिंक",
  "Auto Sync When Online": "ऑनलाइन होने पर ऑटो सिंक",
  "Auto Task Assignment": "ऑटो कार्य असाइनमेंट",
  "Automatically assign tasks to you": "आपको कार्य अपने-आप असाइन करें",
  "Automatically sync data when internet is available": "इंटरनेट उपलब्ध होने पर डेटा अपने-आप सिंक करें",
  "Automatically sync tasks and data": "कार्य और डेटा अपने-आप सिंक करें",
  "Availability, routes and preferences": "उपलब्धता, रूट और प्राथमिकताएं",
  "Avoid blur and backlight": "धुंधलापन और बैकलाइट से बचें",
  "Back": "वापस",
  "Background Check": "पृष्ठभूमि जांच",
  "Background Sync": "बैकग्राउंड सिंक",
  "Biometric Login": "बायोमेट्रिक लॉगिन",
  "Branch": "शाखा",
  "Break Duration": "ब्रेक अवधि",
  "Build": "बिल्ड",
  "Call field support": "फील्ड सपोर्ट को कॉल करें",
  "Cancel": "रद्द करें",
  "Cancelled": "रद्द",
  "Capture Again": "फिर से कैप्चर करें",
  "Capture Customer Photo": "ग्राहक फोटो कैप्चर करें",
  "Capture Documents": "दस्तावेज़ कैप्चर करें",
  "Capture customer photo": "ग्राहक फोटो कैप्चर करें",
  "Capture documents": "दस्तावेज़ कैप्चर करें",
  "Captured": "कैप्चर किया गया",
  "Case accepted successfully!": "केस सफलतापूर्वक स्वीकार हुआ!",
  "Case rejected successfully.": "केस सफलतापूर्वक अस्वीकार हुआ।",
  "Change Password": "पासवर्ड बदलें",
  "Change language": "भाषा बदलें",
  "Check-In Successful! Geo-Fence Verified.": "चेक-इन सफल! जियो-फेंस सत्यापित।",
  "Check-In Verified": "चेक-इन सत्यापित",
  "Check-In at Location": "स्थान पर चेक-इन",
  "Checklist Progress": "चेकलिस्ट प्रगति",
  "Choose distance measurement unit": "दूरी माप इकाई चुनें",
  "Choose how data is synced": "डेटा कैसे सिंक हो चुनें",
  "Choose who can view your profile information": "आपकी प्रोफाइल जानकारी कौन देख सकता है चुनें",
  "Choose your default map application": "अपना डिफॉल्ट मैप ऐप चुनें",
  "Choose your preferred app theme": "अपना पसंदीदा ऐप थीम चुनें",
  "Clear": "साफ़ करें",
  "Clear Cached Data": "कैश डेटा साफ़ करें",
  "Clear Offline Data": "ऑफलाइन डेटा साफ़ करें",
  "Clear Personal Data": "व्यक्तिगत डेटा साफ़ करें",
  "Close menu": "मेनू बंद करें",
  "Company Provided": "कंपनी द्वारा प्रदान",
  "Completed": "पूर्ण",
  "Contact Name": "संपर्क नाम",
  "Contact Number": "संपर्क नंबर",
  "Contact Support": "सपोर्ट से संपर्क करें",
  "Continue": "जारी रखें",
  "Control how your data is shared": "आपका डेटा कैसे साझा हो नियंत्रित करें",
  "Create Task": "कार्य बनाएं",
  "Create Ticket": "टिकट बनाएं",
  "Create a new field visit request": "नया फील्ड विजिट अनुरोध बनाएं",
  "Create a task with customer, visit and document details.": "ग्राहक, विजिट और दस्तावेज़ विवरण के साथ कार्य बनाएं।",
  "Create support ticket": "सपोर्ट टिकट बनाएं",
  "Creating...": "बन रहा है...",
  "Current Address": "वर्तमान पता",
  "Customer Details": "ग्राहक विवरण",
  "Customer Name": "ग्राहक नाम",
  "Customer Signature": "ग्राहक हस्ताक्षर",
  "Customer Unavailable for Visit": "ग्राहक विजिट के लिए उपलब्ध नहीं",
  "Customer name": "ग्राहक नाम",
  "Customer signature": "ग्राहक हस्ताक्षर",
  "Customer's face should be clearly visible": "ग्राहक का चेहरा साफ़ दिखना चाहिए",
  "Dashboard": "डैशबोर्ड",
  "Data & Permissions": "डेटा और अनुमतियां",
  "Data & Sync": "डेटा और सिंक",
  "Data Categories": "डेटा श्रेणियां",
  "Data Sharing": "डेटा साझा करना",
  "Data Sync Mode": "डेटा सिंक मोड",
  "Data available for offline access": "ऑफलाइन एक्सेस के लिए डेटा उपलब्ध",
  "Data saved on this device": "इस डिवाइस पर सेव डेटा",
  "Data waiting to be synced": "सिंक के लिए प्रतीक्षारत डेटा",
  "Date": "तारीख",
  "Date & Time": "तारीख और समय",
  "Date of Birth": "जन्म तिथि",
  "Date of Joining": "जॉइनिंग तिथि",
  "Default Location": "डिफॉल्ट स्थान",
  "Department": "विभाग",
  "Describe the issue before creating a ticket.": "टिकट बनाने से पहले समस्या लिखें।",
  "Designation": "पदनाम",
  "Diagnostics": "डायग्नोस्टिक्स",
  "Diagnostics Passed": "डायग्नोस्टिक्स पास",
  "Distance": "दूरी",
  "Distance Unit": "दूरी इकाई",
  "Document Collection": "दस्तावेज़ संग्रह",
  "Document Updates": "दस्तावेज़ अपडेट",
  "Document and signature capture": "दस्तावेज़ और हस्ताक्षर कैप्चर",
  "Documents": "दस्तावेज़",
  "Does the customer reside at this address?": "क्या ग्राहक इस पते पर रहता है?",
  "Done": "पूर्ण",
  "Download My Data": "मेरा डेटा डाउनलोड करें",
  "Download a copy of your personal data": "अपने व्यक्तिगत डेटा की प्रति डाउनलोड करें",
  "Downloaded tasks and sync status": "डाउनलोड किए गए कार्य और सिंक स्थिति",
  "Due Reminders": "देय रिमाइंडर",
  "Duplicate Task Assignment": "डुप्लिकेट कार्य असाइनमेंट",
  "Edit Emergency Contact": "आपात संपर्क संपादित करें",
  "Edit Personal Details": "व्यक्तिगत विवरण संपादित करें",
  "Email Address": "ईमेल पता",
  "Email Notifications": "ईमेल सूचनाएं",
  "Emergency Contact": "आपात संपर्क",
  "Employee Code": "कर्मचारी कोड",
  "Employee Details": "कर्मचारी विवरण",
  "Employee Documents": "कर्मचारी दस्तावेज़",
  "Employee ID": "कर्मचारी आईडी",
  "Employee Information": "कर्मचारी जानकारी",
  "Employee Type": "कर्मचारी प्रकार",
  "Enable Notifications": "सूचनाएं सक्षम करें",
  "Enabled": "सक्षम",
  "English": "अंग्रेज़ी",
  "Ensure all corners are visible.": "सभी कोने दिखाई देने चाहिए।",
  "Ensure document is clear and all details are visible.": "दस्तावेज़ और सभी विवरण साफ़ दिखने चाहिए।",
  "Ensure good lighting and clear visibility": "अच्छी रोशनी और साफ़ दृश्य रखें",
  "Ensure the signature is clear and within the box.": "हस्ताक्षर साफ़ और बॉक्स के भीतर हो।",
  "Enter mobile number": "मोबाइल नंबर दर्ज करें",
  "Enter notes here...": "यहां नोट्स दर्ज करें...",
  "Enter the 6-digit OTP sent to": "भेजा गया 6 अंकों का OTP दर्ज करें",
  "Environment": "पर्यावरण",
  "Escalate field blockers": "फील्ड बाधाओं को एस्केलेट करें",
  "Escalations & Alerts": "एस्केलेशन और अलर्ट",
  "FAQs": "सामान्य प्रश्न",
  "FAQs, tickets and emergency support": "FAQ, टिकट और आपात सपोर्ट",
  "FAQs, tutorials and support": "FAQ, ट्यूटोरियल और सपोर्ट",
  "Facing an issue?": "समस्या आ रही है?",
  "Field": "फील्ड",
  "Field Executive": "फील्ड एक्जीक्यूटिव",
  "Field Investigation": "फील्ड जांच",
  "Field Operations": "फील्ड ऑपरेशन",
  "Field Operations Made Simple": "फील्ड ऑपरेशन सरल बनाए गए",
  "Field agent illustration": "फील्ड एजेंट चित्र",
  "Field operations, verification tasks and customer visits in one secure mobile workspace.": "फील्ड ऑपरेशन, सत्यापन कार्य और ग्राहक विजिट एक सुरक्षित मोबाइल वर्कस्पेस में।",
  "Fill task title, customer, valid mobile number, and address.": "कार्य शीर्षक, ग्राहक, वैध मोबाइल नंबर और पता भरें।",
  "Filter": "फ़िल्टर",
  "Flash": "फ्लैश",
  "Flip Camera": "कैमरा बदलें",
  "For security reasons, please do not share your OTP with anyone.": "सुरक्षा कारणों से अपना OTP किसी से साझा न करें।",
  "Free up space by clearing locally cached data": "लोकल कैश डेटा साफ़ कर जगह खाली करें",
  "Full Name": "पूरा नाम",
  "Full Time": "पूर्णकालिक",
  "GPS: 3.2m accuracy": "GPS: 3.2 मी सटीकता",
  "Gender": "लिंग",
  "General Settings": "सामान्य सेटिंग्स",
  "Get help with tasks, uploads, sync and app settings.": "कार्य, अपलोड, सिंक और ऐप सेटिंग में सहायता पाएं।",
  "Get reminded to start tasks on time": "कार्य समय पर शुरू करने के रिमाइंडर पाएं",
  "Government IDs": "सरकारी आईडी",
  "HIGH": "उच्च",
  "Help & Support": "सहायता और सपोर्ट",
  "High": "उच्च",
  "History": "इतिहास",
  "Home": "होम",
  "Home Ownership Type": "घर का स्वामित्व प्रकार",
  "How can I change my work availability?": "मैं अपनी कार्य उपलब्धता कैसे बदलूं?",
  "How do I start a field task?": "मैं फील्ड कार्य कैसे शुरू करूं?",
  "How do I sync offline task data?": "मैं ऑफलाइन कार्य डेटा कैसे सिंक करूं?",
  "IN PROGRESS": "प्रगति में",
  "If any of the above information is incorrect, please contact your reporting manager or HR department.": "यदि ऊपर की जानकारी गलत है, तो अपने रिपोर्टिंग मैनेजर या HR विभाग से संपर्क करें।",
  "Important alerts and escalation notifications": "महत्वपूर्ण अलर्ट और एस्केलेशन सूचनाएं",
  "Important announcements and messages": "महत्वपूर्ण घोषणाएं और संदेश",
  "In Progress": "प्रगति में",
  "In-App Notifications": "इन-ऐप सूचनाएं",
  "Incorrect Customer Phone Number": "गलत ग्राहक फोन नंबर",
  "JPG, PNG up to 5MB": "JPG, PNG 5MB तक",
  "JPG, PNG, PDF up to 5MB": "JPG, PNG, PDF 5MB तक",
  "KYC Verification": "KYC सत्यापन",
  "Kilometers (km)": "किलोमीटर (km)",
  "LOW": "कम",
  "Last Sync": "अंतिम सिंक",
  "Learn standard workflows": "मानक वर्कफ़्लो सीखें",
  "Legal Verification": "कानूनी सत्यापन",
  "Licenses": "लाइसेंस",
  "Limited": "सीमित",
  "Live Location": "लाइव स्थान",
  "Live location": "लाइव स्थान",
  "Location": "स्थान",
  "Location Map": "स्थान मानचित्र",
  "Location Sharing": "स्थान साझा करना",
  "Login securely using OTP": "OTP से सुरक्षित लॉगिन करें",
  "Logout": "लॉगआउट",
  "Low": "कम",
  "MEDIUM": "मध्यम",
  "Manage Devices": "डिवाइस प्रबंधित करें",
  "Manage app permissions": "ऐप अनुमतियां प्रबंधित करें",
  "Manage app preferences and work settings": "ऐप प्राथमिकताएं और कार्य सेटिंग प्रबंधित करें",
  "Manage categories available offline": "ऑफलाइन उपलब्ध श्रेणियां प्रबंधित करें",
  "Manage downloaded data for offline access": "ऑफलाइन एक्सेस के लिए डाउनलोड डेटा प्रबंधित करें",
  "Manage password and security settings": "पासवर्ड और सुरक्षा सेटिंग प्रबंधित करें",
  "Manage your notification preferences": "अपनी सूचना प्राथमिकताएं प्रबंधित करें",
  "Manual Sync": "मैनुअल सिंक",
  "Map Preference": "मैप प्राथमिकता",
  "Medium": "मध्यम",
  "Menu": "मेनू",
  "Mobile Number": "मोबाइल नंबर",
  "Mobile number": "मोबाइल नंबर",
  "Mon - Sat": "सोम - शनि",
  "Monday - Saturday": "सोमवार - शनिवार",
  "Moved": "स्थानांतरित",
  "My Tasks": "मेरे कार्य",
  "Navigate": "नेविगेट",
  "Nearby": "नज़दीकी",
  "Nearby Tasks": "नज़दीकी कार्य",
  "New Field Task": "नया फील्ड कार्य",
  "New field assignment": "नया फील्ड असाइनमेंट",
  "No": "नहीं",
  "No history logs found.": "कोई इतिहास लॉग नहीं मिला।",
  "No tasks found.": "कोई कार्य नहीं मिला।",
  "Note:": "नोट:",
  "Notes (Optional)": "नोट्स (वैकल्पिक)",
  "Notification Channels": "सूचना चैनल",
  "Notification Preference": "सूचना प्राथमिकता",
  "Notification Types": "सूचना प्रकार",
  "Notifications": "सूचनाएं",
  "Notifications when a task is completed": "कार्य पूर्ण होने पर सूचनाएं",
  "OTP Verification": "OTP सत्यापन",
  "Off": "बंद",
  "Official Email": "आधिकारिक ईमेल",
  "Official Mobile": "आधिकारिक मोबाइल",
  "Offline Data": "ऑफलाइन डेटा",
  "Offline Data Overview": "ऑफलाइन डेटा अवलोकन",
  "Offline Data Status": "ऑफलाइन डेटा स्थिति",
  "Offline-ready field verification": "ऑफलाइन-तैयार फील्ड सत्यापन",
  "On": "चालू",
  "Only Me": "केवल मैं",
  "Open menu": "मेनू खोलें",
  "OpenStreetMap tiles": "OpenStreetMap टाइल्स",
  "Optional": "वैकल्पिक",
  "Other": "अन्य",
  "Other Reason": "अन्य कारण",
  "Other Settings": "अन्य सेटिंग्स",
  "Out of Area": "क्षेत्र से बाहर",
  "Overdue": "अतिदेय",
  "Owned": "स्वामित्व",
  "PIN / App Lock": "PIN / ऐप लॉक",
  "Parent's House": "माता-पिता का घर",
  "Pending": "लंबित",
  "Pending Sync": "लंबित सिंक",
  "Personal Details": "व्यक्तिगत विवरण",
  "Personal Info": "व्यक्तिगत जानकारी",
  "Personal Information": "व्यक्तिगत जानकारी",
  "Photo Tips": "फोटो सुझाव",
  "Please capture clear and readable documents.": "कृपया साफ़ और पढ़ने योग्य दस्तावेज़ कैप्चर करें।",
  "Please capture clear photo": "कृपया साफ़ फोटो कैप्चर करें",
  "Please capture the customer's signature.": "कृपया ग्राहक का हस्ताक्षर कैप्चर करें।",
  "Please verify the address details with the customer.": "कृपया ग्राहक से पता विवरण सत्यापित करें।",
  "Popular Questions": "लोकप्रिय प्रश्न",
  "Prepare Escalation": "एस्केलेशन तैयार करें",
  "Preview": "पूर्वावलोकन",
  "Priority": "प्राथमिकता",
  "Priority escalation prepared for Field Support.": "फील्ड सपोर्ट के लिए प्राथमिकता एस्केलेशन तैयार है।",
  "Privacy & Security": "गोपनीयता और सुरक्षा",
  "Privacy Policy": "गोपनीयता नीति",
  "Privacy Settings": "गोपनीयता सेटिंग्स",
  "Production": "प्रोडक्शन",
  "Profile": "प्रोफाइल",
  "Profile Visibility": "प्रोफाइल दृश्यता",
  "Proof Uploaded Successfully": "प्रमाण सफलतापूर्वक अपलोड हुआ",
  "Push Notifications": "पुश सूचनाएं",
  "Quick tutorials": "त्वरित ट्यूटोरियल",
  "REJECTED": "अस्वीकृत",
  "Reason: Insufficient address proof provided.": "कारण: अपर्याप्त पता प्रमाण दिया गया।",
  "Reason: Task was cancelled by admin.": "कारण: कार्य एडमिन द्वारा रद्द किया गया।",
  "Receive alerts within the app": "ऐप के भीतर अलर्ट प्राप्त करें",
  "Receive important alerts via SMS": "SMS से महत्वपूर्ण अलर्ट प्राप्त करें",
  "Receive notifications and alerts": "सूचनाएं और अलर्ट प्राप्त करें",
  "Receive push alerts on your device": "अपने डिवाइस पर पुश अलर्ट प्राप्त करें",
  "Receive reminders for upcoming tasks": "आगामी कार्यों के रिमाइंडर प्राप्त करें",
  "Receive updates on your email": "ईमेल पर अपडेट प्राप्त करें",
  "Recent Activity": "हाल की गतिविधि",
  "Recently Captured": "हाल ही में कैप्चर किया गया",
  "Record Voice Remarks": "वॉइस टिप्पणी रिकॉर्ड करें",
  "Recording...": "रिकॉर्डिंग...",
  "Reject": "अस्वीकार करें",
  "Reject Case": "केस अस्वीकार करें",
  "Reject Case Assignment": "केस असाइनमेंट अस्वीकार करें",
  "Rejected": "अस्वीकृत",
  "Relationship": "संबंध",
  "Reminders for upcoming and overdue tasks": "आगामी और अतिदेय कार्यों के रिमाइंडर",
  "Remove all offline data from this device": "इस डिवाइस से सभी ऑफलाइन डेटा हटाएं",
  "Rented": "किराये पर",
  "Report Issue": "समस्या रिपोर्ट करें",
  "Report a problem with any task.": "किसी भी कार्य की समस्या रिपोर्ट करें।",
  "Report a technical issue": "तकनीकी समस्या रिपोर्ट करें",
  "Reporting Manager": "रिपोर्टिंग मैनेजर",
  "Required": "आवश्यक",
  "Required Checklist": "आवश्यक चेकलिस्ट",
  "Resend OTP": "OTP फिर भेजें",
  "Retake": "फिर लें",
  "Return to agent home": "एजेंट होम पर लौटें",
  "Run Diagnostics": "डायग्नोस्टिक्स चलाएं",
  "Running diagnostics...": "डायग्नोस्टिक्स चल रहा है...",
  "SMS Notifications": "SMS सूचनाएं",
  "Save & Continue": "सेव करें और जारी रखें",
  "Save Changes": "बदलाव सेव करें",
  "Scheduled Time": "निर्धारित समय",
  "Search by task name, customer or ID...": "कार्य नाम, ग्राहक या ID से खोजें...",
  "Search help topics": "सहायता विषय खोजें",
  "Search tasks by name or customer...": "कार्य नाम या ग्राहक से खोजें...",
  "Secure profile and notification settings": "सुरक्षित प्रोफाइल और सूचना सेटिंग्स",
  "Select your working days": "अपने कार्य दिवस चुनें",
  "Send OTP": "OTP भेजें",
  "Sending code...": "कोड भेजा जा रहा है...",
  "Set PIN to protect app access": "ऐप एक्सेस की सुरक्षा के लिए PIN सेट करें",
  "Set your break time": "अपना ब्रेक समय सेट करें",
  "Set your default work location": "अपना डिफॉल्ट कार्य स्थान सेट करें",
  "Set your working hours and shift timings": "अपने कार्य घंटे और शिफ्ट समय सेट करें",
  "Shift Timings": "शिफ्ट समय",
  "Show your active status to others": "अपनी सक्रिय स्थिति दूसरों को दिखाएं",
  "Signature Preview": "हस्ताक्षर पूर्वावलोकन",
  "Signature Verification": "हस्ताक्षर सत्यापन",
  "Signature should be clear and within the box.": "हस्ताक्षर साफ़ और बॉक्स में होना चाहिए।",
  "Signature will be securely captured and stored.": "हस्ताक्षर सुरक्षित रूप से कैप्चर और स्टोर होगा।",
  "Slot": "स्लॉट",
  "Sort by: Start Time v": "क्रम: प्रारंभ समय v",
  "Space used by offline data": "ऑफलाइन डेटा द्वारा उपयोग स्थान",
  "Start Task": "कार्य शुरू करें",
  "Started at 10:25 AM": "10:25 AM पर शुरू",
  "Starting a task": "कार्य शुरू करना",
  "Storage & Management": "स्टोरेज और प्रबंधन",
  "Storage Used": "उपयोग स्टोरेज",
  "Submitting ticket...": "टिकट जमा हो रहा है...",
  "Sunday": "रविवार",
  "Support center": "सपोर्ट सेंटर",
  "Supported formats: JPG, PNG, PDF (Max 5MB each)": "समर्थित प्रारूप: JPG, PNG, PDF (प्रत्येक अधिकतम 5MB)",
  "Sync Now": "अभी सिंक करें",
  "Sync Only on Wi-Fi": "केवल Wi-Fi पर सिंक",
  "Sync Settings": "सिंक सेटिंग्स",
  "Sync data only when connected to Wi-Fi": "Wi-Fi से जुड़े होने पर ही डेटा सिंक करें",
  "Sync pending data now": "लंबित डेटा अभी सिंक करें",
  "Syncing": "सिंक हो रहा है",
  "System Default": "सिस्टम डिफॉल्ट",
  "Tap to capture or upload document": "दस्तावेज़ कैप्चर या अपलोड करने के लिए टैप करें",
  "Tap to upload photo": "फोटो अपलोड करने के लिए टैप करें",
  "Tap to view": "देखने के लिए टैप करें",
  "Task Completion": "कार्य पूर्णता",
  "Task Description": "कार्य विवरण",
  "Task Details": "कार्य विवरण",
  "Task In Progress": "कार्य प्रगति में",
  "Task Reminders": "कार्य रिमाइंडर",
  "Task Settings": "कार्य सेटिंग्स",
  "Task Start Reminder": "कार्य प्रारंभ रिमाइंडर",
  "Task Updates": "कार्य अपडेट",
  "Task and app answers": "कार्य और ऐप उत्तर",
  "Task assignment and route planning": "कार्य असाइनमेंट और रूट योजना",
  "Task created": "कार्य बना",
  "Task title": "कार्य शीर्षक",
  "Team": "टीम",
  "Terms": "शर्तें",
  "Terms & Conditions": "नियम और शर्तें",
  "Theme": "थीम",
  "This Week": "इस सप्ताह",
  "Today": "आज",
  "Today's Tasks": "आज के कार्य",
  "Tomorrow": "कल",
  "Total Offline Data": "कुल ऑफलाइन डेटा",
  "Total Tasks": "कुल कार्य",
  "Track routes and nearby tasks": "रूट और नज़दीकी कार्य ट्रैक करें",
  "Tutorials": "ट्यूटोरियल",
  "Type": "प्रकार",
  "Type your rejection remarks...": "अपनी अस्वीकृति टिप्पणी लिखें...",
  "Unable to upload address proof for Field Investigation.": "फील्ड जांच के लिए पता प्रमाण अपलोड नहीं हो पा रहा है।",
  "Upcoming": "आगामी",
  "Update Checklist": "चेकलिस्ट अपडेट करें",
  "Update your account password": "अपना खाता पासवर्ड अपडेट करें",
  "Upload Only on Wi-Fi": "केवल Wi-Fi पर अपलोड",
  "Upload Proof (Optional)": "प्रमाण अपलोड करें (वैकल्पिक)",
  "Upload task data only when connected to Wi-Fi": "Wi-Fi से जुड़े होने पर ही कार्य डेटा अपलोड करें",
  "Uploading documents": "दस्तावेज़ अपलोड हो रहे हैं",
  "Urgent Help": "तत्काल सहायता",
  "Urgent escalation ready": "तत्काल एस्केलेशन तैयार",
  "Use Photo": "फोटो उपयोग करें",
  "Use Signature": "हस्ताक्षर उपयोग करें",
  "Use fingerprint or face ID to login": "लॉगिन के लिए फिंगरप्रिंट या फेस ID उपयोग करें",
  "Using offline mode": "ऑफलाइन मोड उपयोग में",
  "Validating GPS Geo-Fence...": "GPS जियो-फेंस सत्यापित हो रहा है...",
  "Verification Questionnaire": "सत्यापन प्रश्नावली",
  "Verified": "सत्यापित",
  "Verify & Continue": "सत्यापित करें और जारी रखें",
  "Verify Address": "पता सत्यापित करें",
  "Verify address": "पता सत्यापित करें",
  "Verifying OTP Code...": "OTP कोड सत्यापित हो रहा है...",
  "Version": "संस्करण",
  "View Details": "विवरण देखें",
  "View Map": "मैप देखें",
  "View Tasks": "कार्य देखें",
  "View all": "सभी देखें",
  "Visit Customer Location": "ग्राहक स्थान पर जाएं",
  "Visit customer location": "ग्राहक स्थान पर जाएं",
  "Visited the location and verified the address.": "स्थान पर जाकर पता सत्यापित किया।",
  "Voice Remarks (Required)": "वॉइस टिप्पणी (आवश्यक)",
  "We take your privacy and security seriously. Your data is protected and will never be shared without your consent.": "हम आपकी गोपनीयता और सुरक्षा को गंभीरता से लेते हैं। आपका डेटा सुरक्षित है और आपकी सहमति के बिना साझा नहीं किया जाएगा।",
  "We will send you a One Time Password on your mobile number": "हम आपके मोबाइल नंबर पर वन टाइम पासवर्ड भेजेंगे",
  "Weekly Off": "साप्ताहिक अवकाश",
  "What FieldOps Covers": "FieldOps क्या कवर करता है",
  "What should I do if documents fail to upload?": "दस्तावेज़ अपलोड न हों तो क्या करें?",
  "When data was last synced": "डेटा अंतिम बार कब सिंक हुआ",
  "While Using": "उपयोग के दौरान",
  "Wi-Fi & Mobile Data": "Wi-Fi और मोबाइल डेटा",
  "Within Check-In Range": "चेक-इन सीमा में",
  "Work Days": "कार्य दिवस",
  "Work Details": "कार्य विवरण",
  "Work Location": "कार्य स्थान",
  "Work Settings": "कार्य सेटिंग्स",
  "Working Days": "कार्य दिवस",
  "Working Hours": "कार्य घंटे",
  "Yes": "हां",
  "You can manage how and when you want to receive notifications.": "आप सूचनाएं कैसे और कब प्राप्त करें, यह प्रबंधित कर सकते हैं।",
  "You have 5 tasks assigned today.": "आज आपको 5 कार्य असाइन हैं।",
  "Your data is safe and secure with us": "आपका डेटा हमारे पास सुरक्षित है",
  "Australia": "ऑस्ट्रेलिया",
  "Canada": "कनाडा",
  "France": "फ्रांस",
  "Germany": "जर्मनी",
  "India": "भारत",
  "Invalid OTP": "अमान्य OTP",
  "Invalid mobile number": "अमान्य मोबाइल नंबर",
  "Japan": "जापान",
  "Singapore": "सिंगापुर",
  "United Arab Emirates": "संयुक्त अरब अमीरात",
  "United Kingdom": "यूनाइटेड किंगडम",
  "United States": "संयुक्त राज्य अमेरिका",
};

const mr: Record<string, string> = {
  "About FieldOps": "FieldOps बद्दल",
  "Accept Case": "केस स्वीकारा",
  "Account Security": "खाते सुरक्षा",
  "Accurate to 10 meters": "10 मीटरपर्यंत अचूक",
  "Activity Status": "क्रियाकलाप स्थिती",
  "Add Document": "दस्तऐवज जोडा",
  "Add More": "आणखी जोडा",
  "Add Task": "कार्य जोडा",
  "Address": "पत्ता",
  "Agent App": "एजंट अॅप",
  "Alerts and reminder settings": "अलर्ट आणि स्मरणपत्र सेटिंग",
  "Alerts for document uploads and verifications": "दस्तऐवज अपलोड आणि पडताळणी अलर्ट",
  "Alerts for task assignment, updates and changes": "कार्य असाइनमेंट, अपडेट आणि बदलांचे अलर्ट",
  "All": "सर्व",
  "All Logs": "सर्व लॉग",
  "Allow app to access your location": "अॅपला तुमचे स्थान वापरू द्या",
  "Allow app to sync in the background": "अॅपला पार्श्वभूमीत सिंक करू द्या",
  "Announcements": "घोषणा",
  "App Information": "अॅप माहिती",
  "App Permissions": "अॅप परवानग्या",
  "App version and information": "अॅप आवृत्ती आणि माहिती",
  "App version, policies and diagnostics": "अॅप आवृत्ती, धोरणे आणि डायग्नोस्टिक्स",
  "Approximate Stay Duration": "अंदाजे राहण्याचा कालावधी",
  "Ask the customer to sign in the box above.": "ग्राहकाला वरच्या बॉक्समध्ये स्वाक्षरी करायला सांगा.",
  "Assigned, pending and completed work": "असाइन, प्रलंबित आणि पूर्ण काम",
  "Auto Sync": "ऑटो सिंक",
  "Auto Sync When Online": "ऑनलाइन असताना ऑटो सिंक",
  "Auto Task Assignment": "ऑटो कार्य असाइनमेंट",
  "Automatically assign tasks to you": "कार्य आपोआप तुम्हाला असाइन करा",
  "Automatically sync data when internet is available": "इंटरनेट उपलब्ध असताना डेटा आपोआप सिंक करा",
  "Automatically sync tasks and data": "कार्य आणि डेटा आपोआप सिंक करा",
  "Availability, routes and preferences": "उपलब्धता, मार्ग आणि प्राधान्ये",
  "Avoid blur and backlight": "धूसरपणा आणि बॅकलाइट टाळा",
  "Back": "मागे",
  "Background Check": "पार्श्वभूमी तपासणी",
  "Background Sync": "पार्श्वभूमी सिंक",
  "Biometric Login": "बायोमेट्रिक लॉगिन",
  "Branch": "शाखा",
  "Break Duration": "ब्रेक कालावधी",
  "Build": "बिल्ड",
  "Call field support": "फील्ड सपोर्टला कॉल करा",
  "Cancel": "रद्द करा",
  "Cancelled": "रद्द",
  "Capture Again": "पुन्हा कॅप्चर करा",
  "Capture Customer Photo": "ग्राहक फोटो कॅप्चर करा",
  "Capture Documents": "दस्तऐवज कॅप्चर करा",
  "Capture customer photo": "ग्राहक फोटो कॅप्चर करा",
  "Capture documents": "दस्तऐवज कॅप्चर करा",
  "Captured": "कॅप्चर झाले",
  "Case accepted successfully!": "केस यशस्वीरित्या स्वीकारला!",
  "Case rejected successfully.": "केस यशस्वीरित्या नाकारला.",
  "Change Password": "पासवर्ड बदला",
  "Change language": "भाषा बदला",
  "Check-In Successful! Geo-Fence Verified.": "चेक-इन यशस्वी! जिओ-फेन्स पडताळला.",
  "Check-In Verified": "चेक-इन पडताळले",
  "Check-In at Location": "स्थानावर चेक-इन",
  "Checklist Progress": "चेकलिस्ट प्रगती",
  "Choose distance measurement unit": "अंतर मापन एकक निवडा",
  "Choose how data is synced": "डेटा कसा सिंक होईल ते निवडा",
  "Choose who can view your profile information": "तुमची प्रोफाइल माहिती कोण पाहू शकते ते निवडा",
  "Choose your default map application": "तुमचे डीफॉल्ट मॅप अॅप निवडा",
  "Choose your preferred app theme": "तुमची पसंतीची अॅप थीम निवडा",
  "Clear": "साफ करा",
  "Clear Cached Data": "कॅश डेटा साफ करा",
  "Clear Offline Data": "ऑफलाइन डेटा साफ करा",
  "Clear Personal Data": "वैयक्तिक डेटा साफ करा",
  "Close menu": "मेनू बंद करा",
  "Company Provided": "कंपनीकडून प्रदान",
  "Completed": "पूर्ण",
  "Contact Name": "संपर्क नाव",
  "Contact Number": "संपर्क क्रमांक",
  "Contact Support": "सपोर्टशी संपर्क",
  "Continue": "सुरू ठेवा",
  "Control how your data is shared": "तुमचा डेटा कसा शेअर होतो ते नियंत्रित करा",
  "Create Task": "कार्य तयार करा",
  "Create Ticket": "तिकीट तयार करा",
  "Create a new field visit request": "नवीन फील्ड भेट विनंती तयार करा",
  "Create a task with customer, visit and document details.": "ग्राहक, भेट आणि दस्तऐवज तपशीलासह कार्य तयार करा.",
  "Create support ticket": "सपोर्ट तिकीट तयार करा",
  "Creating...": "तयार होत आहे...",
  "Current Address": "सध्याचा पत्ता",
  "Customer Details": "ग्राहक तपशील",
  "Customer Name": "ग्राहक नाव",
  "Customer Signature": "ग्राहक स्वाक्षरी",
  "Customer Unavailable for Visit": "ग्राहक भेटीसाठी उपलब्ध नाही",
  "Customer name": "ग्राहक नाव",
  "Customer signature": "ग्राहक स्वाक्षरी",
  "Customer's face should be clearly visible": "ग्राहकाचा चेहरा स्पष्ट दिसला पाहिजे",
  "Dashboard": "डॅशबोर्ड",
  "Data & Permissions": "डेटा आणि परवानग्या",
  "Data & Sync": "डेटा आणि सिंक",
  "Data Categories": "डेटा श्रेणी",
  "Data Sharing": "डेटा शेअरिंग",
  "Data Sync Mode": "डेटा सिंक मोड",
  "Data available for offline access": "ऑफलाइन प्रवेशासाठी डेटा उपलब्ध",
  "Data saved on this device": "या डिव्हाइसवर सेव्ह डेटा",
  "Data waiting to be synced": "सिंकसाठी प्रतीक्षेत डेटा",
  "Date": "तारीख",
  "Date & Time": "तारीख आणि वेळ",
  "Date of Birth": "जन्मतारीख",
  "Date of Joining": "जॉइनिंग तारीख",
  "Default Location": "डीफॉल्ट स्थान",
  "Department": "विभाग",
  "Describe the issue before creating a ticket.": "तिकीट तयार करण्यापूर्वी समस्या लिहा.",
  "Designation": "पदनाम",
  "Diagnostics": "डायग्नोस्टिक्स",
  "Diagnostics Passed": "डायग्नोस्टिक्स पास",
  "Distance": "अंतर",
  "Distance Unit": "अंतर एकक",
  "Document Collection": "दस्तऐवज संकलन",
  "Document Updates": "दस्तऐवज अपडेट",
  "Document and signature capture": "दस्तऐवज आणि स्वाक्षरी कॅप्चर",
  "Documents": "दस्तऐवज",
  "Does the customer reside at this address?": "ग्राहक या पत्त्यावर राहतो का?",
  "Done": "पूर्ण",
  "Download My Data": "माझा डेटा डाउनलोड करा",
  "Download a copy of your personal data": "तुमच्या वैयक्तिक डेटाची प्रत डाउनलोड करा",
  "Downloaded tasks and sync status": "डाउनलोड केलेली कार्ये आणि सिंक स्थिती",
  "Due Reminders": "देय स्मरणपत्रे",
  "Duplicate Task Assignment": "डुप्लिकेट कार्य असाइनमेंट",
  "Edit Emergency Contact": "आपत्कालीन संपर्क संपादित करा",
  "Edit Personal Details": "वैयक्तिक तपशील संपादित करा",
  "Email Address": "ईमेल पत्ता",
  "Email Notifications": "ईमेल सूचना",
  "Emergency Contact": "आपत्कालीन संपर्क",
  "Employee Code": "कर्मचारी कोड",
  "Employee Details": "कर्मचारी तपशील",
  "Employee Documents": "कर्मचारी दस्तऐवज",
  "Employee ID": "कर्मचारी आयडी",
  "Employee Information": "कर्मचारी माहिती",
  "Employee Type": "कर्मचारी प्रकार",
  "Enable Notifications": "सूचना सक्षम करा",
  "Enabled": "सक्षम",
  "English": "इंग्रजी",
  "Ensure all corners are visible.": "सर्व कोपरे दिसले पाहिजेत.",
  "Ensure document is clear and all details are visible.": "दस्तऐवज आणि सर्व तपशील स्पष्ट दिसले पाहिजेत.",
  "Ensure good lighting and clear visibility": "चांगला प्रकाश आणि स्पष्टता ठेवा",
  "Ensure the signature is clear and within the box.": "स्वाक्षरी स्पष्ट आणि बॉक्समध्ये असावी.",
  "Enter mobile number": "मोबाइल क्रमांक प्रविष्ट करा",
  "Enter notes here...": "येथे नोंदी लिहा...",
  "Enter the 6-digit OTP sent to": "पाठवलेला 6 अंकी OTP प्रविष्ट करा",
  "Environment": "पर्यावरण",
  "Escalate field blockers": "फील्ड अडथळे एस्केलेट करा",
  "Escalations & Alerts": "एस्केलेशन आणि अलर्ट",
  "FAQs": "FAQ",
  "FAQs, tickets and emergency support": "FAQ, तिकिटे आणि आपत्कालीन सपोर्ट",
  "FAQs, tutorials and support": "FAQ, ट्यूटोरियल आणि सपोर्ट",
  "Facing an issue?": "समस्या येत आहे?",
  "Field": "फील्ड",
  "Field Executive": "फील्ड एक्झिक्युटिव्ह",
  "Field Investigation": "फील्ड तपासणी",
  "Field Operations": "फील्ड ऑपरेशन्स",
  "Field Operations Made Simple": "फील्ड ऑपरेशन्स सोपे केले",
  "Field agent illustration": "फील्ड एजंट चित्र",
  "Field operations, verification tasks and customer visits in one secure mobile workspace.": "फील्ड ऑपरेशन्स, पडताळणी कार्ये आणि ग्राहक भेटी एका सुरक्षित मोबाइल वर्कस्पेसमध्ये.",
  "Fill task title, customer, valid mobile number, and address.": "कार्य शीर्षक, ग्राहक, वैध मोबाइल क्रमांक आणि पत्ता भरा.",
  "Filter": "फिल्टर",
  "Flash": "फ्लॅश",
  "Flip Camera": "कॅमेरा बदला",
  "For security reasons, please do not share your OTP with anyone.": "सुरक्षेसाठी तुमचा OTP कुणाशीही शेअर करू नका.",
  "Free up space by clearing locally cached data": "लोकल कॅश डेटा साफ करून जागा मोकळी करा",
  "Full Name": "पूर्ण नाव",
  "Full Time": "पूर्णवेळ",
  "GPS: 3.2m accuracy": "GPS: 3.2 मी अचूकता",
  "Gender": "लिंग",
  "General Settings": "सामान्य सेटिंग्ज",
  "Get help with tasks, uploads, sync and app settings.": "कार्य, अपलोड, सिंक आणि अॅप सेटिंगसाठी मदत मिळवा.",
  "Get reminded to start tasks on time": "कार्य वेळेवर सुरू करण्याची स्मरणपत्रे मिळवा",
  "Government IDs": "सरकारी आयडी",
  "HIGH": "उच्च",
  "Help & Support": "मदत आणि सपोर्ट",
  "High": "उच्च",
  "History": "इतिहास",
  "Home": "होम",
  "Home Ownership Type": "घर मालकी प्रकार",
  "How can I change my work availability?": "मी माझी कामाची उपलब्धता कशी बदलू?",
  "How do I start a field task?": "मी फील्ड कार्य कसे सुरू करू?",
  "How do I sync offline task data?": "मी ऑफलाइन कार्य डेटा कसा सिंक करू?",
  "IN PROGRESS": "प्रगतीत",
  "If any of the above information is incorrect, please contact your reporting manager or HR department.": "वरील माहिती चुकीची असल्यास तुमच्या रिपोर्टिंग मॅनेजर किंवा HR विभागाशी संपर्क करा.",
  "Important alerts and escalation notifications": "महत्त्वाचे अलर्ट आणि एस्केलेशन सूचना",
  "Important announcements and messages": "महत्त्वाच्या घोषणा आणि संदेश",
  "In Progress": "प्रगतीत",
  "In-App Notifications": "इन-अॅप सूचना",
  "Incorrect Customer Phone Number": "चुकीचा ग्राहक फोन क्रमांक",
  "JPG, PNG up to 5MB": "JPG, PNG 5MB पर्यंत",
  "JPG, PNG, PDF up to 5MB": "JPG, PNG, PDF 5MB पर्यंत",
  "KYC Verification": "KYC पडताळणी",
  "Kilometers (km)": "किलोमीटर (km)",
  "LOW": "कमी",
  "Last Sync": "शेवटचा सिंक",
  "Learn standard workflows": "मानक वर्कफ्लो शिका",
  "Legal Verification": "कायदेशीर पडताळणी",
  "Licenses": "परवाने",
  "Limited": "मर्यादित",
  "Live Location": "लाईव्ह स्थान",
  "Live location": "लाईव्ह स्थान",
  "Location": "स्थान",
  "Location Map": "स्थान नकाशा",
  "Location Sharing": "स्थान शेअरिंग",
  "Login securely using OTP": "OTP वापरून सुरक्षित लॉगिन करा",
  "Logout": "लॉगआउट",
  "Low": "कमी",
  "MEDIUM": "मध्यम",
  "Manage Devices": "डिव्हाइस व्यवस्थापित करा",
  "Manage app permissions": "अॅप परवानग्या व्यवस्थापित करा",
  "Manage app preferences and work settings": "अॅप प्राधान्ये आणि काम सेटिंग व्यवस्थापित करा",
  "Manage categories available offline": "ऑफलाइन उपलब्ध श्रेणी व्यवस्थापित करा",
  "Manage downloaded data for offline access": "ऑफलाइन प्रवेशासाठी डाउनलोड डेटा व्यवस्थापित करा",
  "Manage password and security settings": "पासवर्ड आणि सुरक्षा सेटिंग व्यवस्थापित करा",
  "Manage your notification preferences": "तुमची सूचना प्राधान्ये व्यवस्थापित करा",
  "Manual Sync": "मॅन्युअल सिंक",
  "Map Preference": "मॅप प्राधान्य",
  "Medium": "मध्यम",
  "Menu": "मेनू",
  "Mobile Number": "मोबाइल क्रमांक",
  "Mobile number": "मोबाइल क्रमांक",
  "Mon - Sat": "सोम - शनि",
  "Monday - Saturday": "सोमवार - शनिवार",
  "Moved": "हलवले",
  "My Tasks": "माझी कार्ये",
  "Navigate": "नेव्हिगेट",
  "Nearby": "जवळचे",
  "Nearby Tasks": "जवळची कार्ये",
  "New Field Task": "नवीन फील्ड कार्य",
  "New field assignment": "नवीन फील्ड असाइनमेंट",
  "No": "नाही",
  "No history logs found.": "इतिहास लॉग सापडले नाहीत.",
  "No tasks found.": "कार्ये सापडली नाहीत.",
  "Note:": "टीप:",
  "Notes (Optional)": "नोंदी (ऐच्छिक)",
  "Notification Channels": "सूचना चॅनेल",
  "Notification Preference": "सूचना प्राधान्य",
  "Notification Types": "सूचना प्रकार",
  "Notifications": "सूचना",
  "Notifications when a task is completed": "कार्य पूर्ण झाल्यावर सूचना",
  "OTP Verification": "OTP पडताळणी",
  "Off": "बंद",
  "Official Email": "अधिकृत ईमेल",
  "Official Mobile": "अधिकृत मोबाइल",
  "Offline Data": "ऑफलाइन डेटा",
  "Offline Data Overview": "ऑफलाइन डेटा आढावा",
  "Offline Data Status": "ऑफलाइन डेटा स्थिती",
  "Offline-ready field verification": "ऑफलाइन-तयार फील्ड पडताळणी",
  "On": "चालू",
  "Only Me": "फक्त मी",
  "Open menu": "मेनू उघडा",
  "OpenStreetMap tiles": "OpenStreetMap टाइल्स",
  "Optional": "ऐच्छिक",
  "Other": "इतर",
  "Other Reason": "इतर कारण",
  "Other Settings": "इतर सेटिंग्ज",
  "Out of Area": "क्षेत्राबाहेर",
  "Overdue": "मुदतबाह्य",
  "Owned": "मालकीचे",
  "PIN / App Lock": "PIN / अॅप लॉक",
  "Parent's House": "पालकांचे घर",
  "Pending": "प्रलंबित",
  "Pending Sync": "प्रलंबित सिंक",
  "Personal Details": "वैयक्तिक तपशील",
  "Personal Info": "वैयक्तिक माहिती",
  "Personal Information": "वैयक्तिक माहिती",
  "Photo Tips": "फोटो टिप्स",
  "Please capture clear and readable documents.": "कृपया स्पष्ट आणि वाचनीय दस्तऐवज कॅप्चर करा.",
  "Please capture clear photo": "कृपया स्पष्ट फोटो कॅप्चर करा",
  "Please capture the customer's signature.": "कृपया ग्राहकाची स्वाक्षरी कॅप्चर करा.",
  "Please verify the address details with the customer.": "कृपया ग्राहकासोबत पत्ता तपशील पडताळा.",
  "Popular Questions": "लोकप्रिय प्रश्न",
  "Prepare Escalation": "एस्केलेशन तयार करा",
  "Preview": "पूर्वावलोकन",
  "Priority": "प्राधान्य",
  "Priority escalation prepared for Field Support.": "फील्ड सपोर्टसाठी प्राधान्य एस्केलेशन तयार आहे.",
  "Privacy & Security": "गोपनीयता आणि सुरक्षा",
  "Privacy Policy": "गोपनीयता धोरण",
  "Privacy Settings": "गोपनीयता सेटिंग्ज",
  "Production": "प्रॉडक्शन",
  "Profile": "प्रोफाइल",
  "Profile Visibility": "प्रोफाइल दृश्यता",
  "Proof Uploaded Successfully": "पुरावा यशस्वीरित्या अपलोड झाला",
  "Push Notifications": "पुश सूचना",
  "Quick tutorials": "त्वरित ट्यूटोरियल",
  "REJECTED": "नाकारले",
  "Reason: Insufficient address proof provided.": "कारण: अपुरा पत्ता पुरावा दिला.",
  "Reason: Task was cancelled by admin.": "कारण: कार्य अॅडमिनने रद्द केले.",
  "Receive alerts within the app": "अॅपमध्ये अलर्ट मिळवा",
  "Receive important alerts via SMS": "SMS द्वारे महत्त्वाचे अलर्ट मिळवा",
  "Receive notifications and alerts": "सूचना आणि अलर्ट मिळवा",
  "Receive push alerts on your device": "तुमच्या डिव्हाइसवर पुश अलर्ट मिळवा",
  "Receive reminders for upcoming tasks": "आगामी कार्यांसाठी स्मरणपत्रे मिळवा",
  "Receive updates on your email": "ईमेलवर अपडेट मिळवा",
  "Recent Activity": "अलीकडील क्रियाकलाप",
  "Recently Captured": "अलीकडे कॅप्चर केले",
  "Record Voice Remarks": "व्हॉइस टिप्पणी रेकॉर्ड करा",
  "Recording...": "रेकॉर्डिंग...",
  "Reject": "नाकारा",
  "Reject Case": "केस नाकारा",
  "Reject Case Assignment": "केस असाइनमेंट नाकारा",
  "Rejected": "नाकारले",
  "Relationship": "संबंध",
  "Reminders for upcoming and overdue tasks": "आगामी आणि मुदतबाह्य कार्यांसाठी स्मरणपत्रे",
  "Remove all offline data from this device": "या डिव्हाइसमधील सर्व ऑफलाइन डेटा काढा",
  "Rented": "भाड्याने",
  "Report Issue": "समस्या नोंदवा",
  "Report a problem with any task.": "कोणत्याही कार्याची समस्या नोंदवा.",
  "Report a technical issue": "तांत्रिक समस्या नोंदवा",
  "Reporting Manager": "रिपोर्टिंग मॅनेजर",
  "Required": "आवश्यक",
  "Required Checklist": "आवश्यक चेकलिस्ट",
  "Resend OTP": "OTP पुन्हा पाठवा",
  "Retake": "पुन्हा घ्या",
  "Return to agent home": "एजंट होमवर परत जा",
  "Run Diagnostics": "डायग्नोस्टिक्स चालवा",
  "Running diagnostics...": "डायग्नोस्टिक्स चालू आहे...",
  "SMS Notifications": "SMS सूचना",
  "Save & Continue": "सेव्ह करा आणि पुढे चला",
  "Save Changes": "बदल सेव्ह करा",
  "Scheduled Time": "नियोजित वेळ",
  "Search by task name, customer or ID...": "कार्य नाव, ग्राहक किंवा ID ने शोधा...",
  "Search help topics": "मदत विषय शोधा",
  "Search tasks by name or customer...": "कार्य नाव किंवा ग्राहकाने शोधा...",
  "Secure profile and notification settings": "सुरक्षित प्रोफाइल आणि सूचना सेटिंग्ज",
  "Select your working days": "तुमचे कामाचे दिवस निवडा",
  "Send OTP": "OTP पाठवा",
  "Sending code...": "कोड पाठवत आहे...",
  "Set PIN to protect app access": "अॅप प्रवेशासाठी PIN सेट करा",
  "Set your break time": "तुमचा ब्रेक वेळ सेट करा",
  "Set your default work location": "तुमचे डीफॉल्ट कामाचे स्थान सेट करा",
  "Set your working hours and shift timings": "तुमचे कामाचे तास आणि शिफ्ट वेळ सेट करा",
  "Shift Timings": "शिफ्ट वेळ",
  "Show your active status to others": "तुमची सक्रिय स्थिती इतरांना दाखवा",
  "Signature Preview": "स्वाक्षरी पूर्वावलोकन",
  "Signature Verification": "स्वाक्षरी पडताळणी",
  "Signature should be clear and within the box.": "स्वाक्षरी स्पष्ट आणि बॉक्समध्ये असावी.",
  "Signature will be securely captured and stored.": "स्वाक्षरी सुरक्षितपणे कॅप्चर आणि संग्रहित केली जाईल.",
  "Slot": "स्लॉट",
  "Sort by: Start Time v": "क्रम: सुरू वेळ v",
  "Space used by offline data": "ऑफलाइन डेटाने वापरलेली जागा",
  "Start Task": "कार्य सुरू करा",
  "Started at 10:25 AM": "10:25 AM ला सुरू",
  "Starting a task": "कार्य सुरू करणे",
  "Storage & Management": "स्टोरेज आणि व्यवस्थापन",
  "Storage Used": "वापरलेले स्टोरेज",
  "Submitting ticket...": "तिकीट सबमिट होत आहे...",
  "Sunday": "रविवार",
  "Support center": "सपोर्ट केंद्र",
  "Supported formats: JPG, PNG, PDF (Max 5MB each)": "समर्थित प्रकार: JPG, PNG, PDF (प्रत्येकी कमाल 5MB)",
  "Sync Now": "आता सिंक करा",
  "Sync Only on Wi-Fi": "फक्त Wi-Fi वर सिंक",
  "Sync Settings": "सिंक सेटिंग्ज",
  "Sync data only when connected to Wi-Fi": "Wi-Fi जोडले असताना डेटा सिंक करा",
  "Sync pending data now": "प्रलंबित डेटा आता सिंक करा",
  "Syncing": "सिंक होत आहे",
  "System Default": "सिस्टम डीफॉल्ट",
  "Tap to capture or upload document": "दस्तऐवज कॅप्चर किंवा अपलोड करण्यासाठी टॅप करा",
  "Tap to upload photo": "फोटो अपलोड करण्यासाठी टॅप करा",
  "Tap to view": "पाहण्यासाठी टॅप करा",
  "Task Completion": "कार्य पूर्णता",
  "Task Description": "कार्य वर्णन",
  "Task Details": "कार्य तपशील",
  "Task In Progress": "कार्य प्रगतीत",
  "Task Reminders": "कार्य स्मरणपत्रे",
  "Task Settings": "कार्य सेटिंग्ज",
  "Task Start Reminder": "कार्य सुरू स्मरणपत्र",
  "Task Updates": "कार्य अपडेट",
  "Task and app answers": "कार्य आणि अॅप उत्तरे",
  "Task assignment and route planning": "कार्य असाइनमेंट आणि मार्ग नियोजन",
  "Task created": "कार्य तयार झाले",
  "Task title": "कार्य शीर्षक",
  "Team": "टीम",
  "Terms": "अटी",
  "Terms & Conditions": "अटी आणि शर्ती",
  "Theme": "थीम",
  "This Week": "या आठवड्यात",
  "Today": "आज",
  "Today's Tasks": "आजची कार्ये",
  "Tomorrow": "उद्या",
  "Total Offline Data": "एकूण ऑफलाइन डेटा",
  "Total Tasks": "एकूण कार्ये",
  "Track routes and nearby tasks": "मार्ग आणि जवळची कार्ये ट्रॅक करा",
  "Tutorials": "ट्यूटोरियल",
  "Type": "प्रकार",
  "Type your rejection remarks...": "तुमच्या नकार टिप्पण्या लिहा...",
  "Unable to upload address proof for Field Investigation.": "फील्ड तपासणीसाठी पत्ता पुरावा अपलोड करता येत नाही.",
  "Upcoming": "आगामी",
  "Update Checklist": "चेकलिस्ट अपडेट करा",
  "Update your account password": "तुमचा खाते पासवर्ड अपडेट करा",
  "Upload Only on Wi-Fi": "फक्त Wi-Fi वर अपलोड",
  "Upload Proof (Optional)": "पुरावा अपलोड करा (ऐच्छिक)",
  "Upload task data only when connected to Wi-Fi": "Wi-Fi जोडले असताना कार्य डेटा अपलोड करा",
  "Uploading documents": "दस्तऐवज अपलोड होत आहेत",
  "Urgent Help": "तातडीची मदत",
  "Urgent escalation ready": "तातडीचे एस्केलेशन तयार",
  "Use Photo": "फोटो वापरा",
  "Use Signature": "स्वाक्षरी वापरा",
  "Use fingerprint or face ID to login": "लॉगिनसाठी फिंगरप्रिंट किंवा फेस ID वापरा",
  "Using offline mode": "ऑफलाइन मोड वापरत आहे",
  "Validating GPS Geo-Fence...": "GPS जिओ-फेन्स पडताळत आहे...",
  "Verification Questionnaire": "पडताळणी प्रश्नावली",
  "Verified": "पडताळले",
  "Verify & Continue": "पडताळा आणि पुढे चला",
  "Verify Address": "पत्ता पडताळा",
  "Verify address": "पत्ता पडताळा",
  "Verifying OTP Code...": "OTP कोड पडताळत आहे...",
  "Version": "आवृत्ती",
  "View Details": "तपशील पहा",
  "View Map": "नकाशा पहा",
  "View Tasks": "कार्ये पहा",
  "View all": "सर्व पहा",
  "Visit Customer Location": "ग्राहक स्थानाला भेट द्या",
  "Visit customer location": "ग्राहक स्थानाला भेट द्या",
  "Visited the location and verified the address.": "स्थानाला भेट देऊन पत्ता पडताळला.",
  "Voice Remarks (Required)": "व्हॉइस टिप्पणी (आवश्यक)",
  "We take your privacy and security seriously. Your data is protected and will never be shared without your consent.": "आम्ही तुमची गोपनीयता आणि सुरक्षा गंभीरतेने घेतो. तुमचा डेटा सुरक्षित आहे आणि तुमच्या संमतीशिवाय शेअर केला जाणार नाही.",
  "We will send you a One Time Password on your mobile number": "आम्ही तुमच्या मोबाइल क्रमांकावर वन टाइम पासवर्ड पाठवू",
  "Weekly Off": "साप्ताहिक सुट्टी",
  "What FieldOps Covers": "FieldOps काय कव्हर करते",
  "What should I do if documents fail to upload?": "दस्तऐवज अपलोड न झाल्यास काय करावे?",
  "When data was last synced": "डेटा शेवटचा कधी सिंक झाला",
  "While Using": "वापरताना",
  "Wi-Fi & Mobile Data": "Wi-Fi आणि मोबाइल डेटा",
  "Within Check-In Range": "चेक-इन मर्यादेत",
  "Work Days": "कामाचे दिवस",
  "Work Details": "काम तपशील",
  "Work Location": "कामाचे स्थान",
  "Work Settings": "काम सेटिंग्ज",
  "Working Days": "कामाचे दिवस",
  "Working Hours": "कामाचे तास",
  "Yes": "होय",
  "You can manage how and when you want to receive notifications.": "तुम्हाला सूचना कशा आणि कधी मिळतील ते तुम्ही व्यवस्थापित करू शकता.",
  "You have 5 tasks assigned today.": "आज तुम्हाला 5 कार्ये असाइन आहेत.",
  "Your data is safe and secure with us": "तुमचा डेटा आमच्याकडे सुरक्षित आहे",
  "Australia": "ऑस्ट्रेलिया",
  "Canada": "कॅनडा",
  "France": "फ्रान्स",
  "Germany": "जर्मनी",
  "India": "भारत",
  "Invalid OTP": "अवैध OTP",
  "Invalid mobile number": "अवैध मोबाइल क्रमांक",
  "Japan": "जपान",
  "Singapore": "सिंगापूर",
  "United Arab Emirates": "संयुक्त अरब अमिराती",
  "United Kingdom": "युनायटेड किंगडम",
  "United States": "संयुक्त राज्य अमेरिका",
};

const dictionaries: Record<Exclude<Language, "en">, Record<string, string>> = { hi, mr };
const textOriginals = new WeakMap<Text, string>();
const translatableAttributes = ["placeholder", "aria-label", "title", "alt"];

const skipTextSelector = "script, style, svg, input, textarea, [data-no-translate], [data-language-dropdown]";
const skipAttributeSelector = "script, style, svg, [data-no-translate], [data-language-dropdown]";

const selectedLanguageLabel = (language: Language) => {
  return languageOptions.find((option) => option.code === language)?.nativeLabel ?? "English";
};

function translateKnown(text: string, language: Language) {
  if (language === "en") return text;

  const dictionary = dictionaries[language];
  if (dictionary[text]) return dictionary[text];

  let translated = text;
  const replacements = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);

  for (const [source, target] of replacements) {
    if (source.length < 4 || !translated.includes(source)) continue;
    if (!source.includes(" ") && !/[&:/().-]/.test(source)) continue;
    translated = translated.split(source).join(target);
  }

  if (translated !== text) return translated;

  return text
    .replace(/^(.+) found$/, (_, count) => (language === "hi" ? `${count} मिले` : `${count} सापडले`))
    .replace(/^(.+) Completed$/, (_, count) => (language === "hi" ? `${count} पूर्ण` : `${count} पूर्ण`))
    .replace(/^Completed at (.+)$/, (_, value) => (language === "hi" ? `${value} पर पूर्ण` : `${value} ला पूर्ण`))
    .replace(/^Started at (.+)$/, (_, value) => (language === "hi" ? `${value} पर शुरू` : `${value} ला सुरू`))
    .replace(/^Version (.+)$/, (_, value) => (language === "hi" ? `संस्करण ${value}` : `आवृत्ती ${value}`));
}

export function translateText(text: string, language: Language) {
  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match) return text;

  const [, leading, body, trailing] = match;
  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) return text;

  return `${leading}${translateKnown(normalized, language)}${trailing}`;
}

function shouldSkip(node: Node) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(skipTextSelector));
}

function translateTextNode(node: Text, language: Language) {
  if (shouldSkip(node)) return;

  const current = node.nodeValue ?? "";
  const stored = textOriginals.get(node);
  const translatedStored = stored ? translateText(stored, language) : "";
  const knownTranslatedValue = stored
    ? ([translateText(stored, "hi"), translateText(stored, "mr")] as string[]).includes(current)
    : false;

  if (!stored || (!knownTranslatedValue && current !== translatedStored)) {
    textOriginals.set(node, current);
  }

  const original = textOriginals.get(node) ?? current;
  const next = language === "en" ? original : translateText(original, language);

  if (node.nodeValue !== next) {
    node.nodeValue = next;
  }
}

function translateElementAttributes(element: Element, language: Language) {
  if (element.closest(skipAttributeSelector)) return;

  for (const attribute of translatableAttributes) {
    const current = element.getAttribute(attribute);
    if (!current) continue;

    const originalKey = `data-i18n-original-${attribute}`;
    const stored = element.getAttribute(originalKey);
    const translatedStored = stored ? translateText(stored, language) : "";
    const knownTranslatedValue = stored
      ? ([translateText(stored, "hi"), translateText(stored, "mr")] as string[]).includes(current)
      : false;

    if (!stored || (!knownTranslatedValue && current !== translatedStored)) {
      element.setAttribute(originalKey, current);
    }

    const original = element.getAttribute(originalKey) ?? current;
    const next = language === "en" ? original : translateText(original, language);

    if (element.getAttribute(attribute) !== next) {
      element.setAttribute(attribute, next);
    }
  }
}

function translateTree(root: HTMLElement, language: Language) {
  root.querySelectorAll<HTMLElement>("[data-language-label]").forEach((element) => {
    element.textContent = selectedLanguageLabel(language);
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    translateTextNode(node as Text, language);
    node = walker.nextNode();
  }

  translateElementAttributes(root, language);
  root.querySelectorAll("*").forEach((element) => translateElementAttributes(element, language));
}

export function useDomTranslations(rootRef: RefObject<HTMLElement | null>, language: Language) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    let frame = 0;
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => translateTree(root, language));
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      attributes: true,
      attributeFilter: translatableAttributes,
      childList: true,
      characterData: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language, rootRef]);
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "hi" || saved === "mr" || saved === "en" ? saved : "en";
  });

  const setLanguage = useCallback((nextLanguage: Language) => {
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    languages: languageOptions,
    setLanguage,
    t: (text: string) => translateText(text, language),
  }), [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

export function LanguageDropdown() {
  const { language, languages, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const optionButton = target.closest<HTMLElement>("[data-language-option]");
      const optionCode = optionButton?.dataset.languageOption;
      if (optionCode === "en" || optionCode === "hi" || optionCode === "mr") {
        event.preventDefault();
        setLanguage(optionCode);
        setOpen(false);
        return;
      }

      const languageButton = target.closest("button")?.querySelector("[data-language-label]")
        ? target.closest("button")
        : target.closest("button[aria-label='Change language']");

      if (languageButton) {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (!dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [setLanguage]);

  if (!open) return null;

  return (
    <div data-language-dropdown className="pointer-events-none fixed left-1/2 top-[60px] z-[80] w-full max-w-[430px] -translate-x-1/2 px-5">
      <div ref={dropdownRef} className="pointer-events-auto ml-auto w-48 overflow-hidden rounded-2xl border border-[#d8e0eb] bg-white shadow-[0_18px_42px_rgba(10,25,48,0.18)]">
        {languages.map((option) => (
          <button
            key={option.code}
            data-language-option={option.code}
            onClick={() => {
              setLanguage(option.code);
              setOpen(false);
            }}
            type="button"
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold transition-colors ${
              option.code === language ? "bg-[#edf5ff] text-[#1158d4]" : "bg-white text-[#07183f] hover:bg-slate-50"
            }`}
          >
            <span>{option.nativeLabel}</span>
            <span className="text-[10px] font-bold uppercase text-[#7c879b]">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
