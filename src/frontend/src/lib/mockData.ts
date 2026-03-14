import type { AnalysisResult } from "../backend.d";

const ANDROID_PERMISSIONS = [
  "android.permission.CAMERA",
  "android.permission.READ_CONTACTS",
  "android.permission.WRITE_CONTACTS",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.READ_PHONE_STATE",
  "android.permission.SEND_SMS",
  "android.permission.RECEIVE_SMS",
  "android.permission.READ_SMS",
  "android.permission.RECORD_AUDIO",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.INTERNET",
  "android.permission.BLUETOOTH",
  "android.permission.NFC",
  "android.permission.VIBRATE",
  "android.permission.WAKE_LOCK",
  "android.permission.RECEIVE_BOOT_COMPLETED",
  "android.permission.CHANGE_NETWORK_STATE",
  "android.permission.ACCESS_WIFI_STATE",
];

const DANGEROUS_PERMISSIONS = new Set([
  "android.permission.CAMERA",
  "android.permission.READ_CONTACTS",
  "android.permission.WRITE_CONTACTS",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.READ_PHONE_STATE",
  "android.permission.SEND_SMS",
  "android.permission.RECEIVE_SMS",
  "android.permission.READ_SMS",
  "android.permission.RECORD_AUDIO",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
]);

const VULNERABILITIES = [
  {
    title: "Insecure Data Storage",
    description: "Sensitive data stored in plaintext SharedPreferences",
    file: "com/app/prefs/UserPrefs.java",
  },
  {
    title: "Weak Cryptography",
    description: "MD5 used for password hashing — considered broken",
    file: "com/app/security/CryptoUtils.java",
  },
  {
    title: "SQL Injection Risk",
    description: "Raw SQL queries constructed from user input",
    file: "com/app/db/DatabaseHelper.java",
  },
  {
    title: "Hardcoded Credentials",
    description: "API key embedded directly in source code",
    file: "com/app/network/ApiClient.java",
  },
  {
    title: "Unvalidated Intent Redirect",
    description:
      "Intent data used without validation, enabling redirect attacks",
    file: "com/app/ui/DeepLinkActivity.java",
  },
  {
    title: "Insecure Network Communication",
    description: "HTTP used instead of HTTPS for API calls",
    file: "com/app/network/NetworkManager.java",
  },
  {
    title: "Improper Certificate Validation",
    description: "TrustManager accepts all certificates",
    file: "com/app/ssl/CustomTrustManager.java",
  },
  {
    title: "Exported Component Vulnerability",
    description: "Activity exported without proper permission check",
    file: "com/app/ui/InternalActivity.java",
  },
  {
    title: "Insecure File Permissions",
    description: "World-readable files created with MODE_WORLD_READABLE",
    file: "com/app/storage/FileManager.java",
  },
  {
    title: "JavaScript Bridge Injection",
    description: "WebView JavaScript bridge exposes sensitive APIs",
    file: "com/app/web/WebBridge.java",
  },
  {
    title: "Tapjacking Vulnerability",
    description: "Missing filterTouchesWhenObscured flag",
    file: "com/app/ui/PaymentActivity.java",
  },
  {
    title: "Debug Mode Enabled",
    description: "Application debuggable flag set to true in manifest",
    file: "AndroidManifest.xml",
  },
];

const SEVERITIES = ["Critical", "High", "Medium", "Low"] as const;
type Severity = (typeof SEVERITIES)[number];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface MockPermission {
  name: string;
  type: "Dangerous" | "Normal";
  riskLevel: Severity;
}

export function generatePermissions(count: bigint): MockPermission[] {
  const n = Math.min(Number(count), ANDROID_PERMISSIONS.length);
  return Array.from({ length: n }, (_, i) => {
    const perm = ANDROID_PERMISSIONS[i % ANDROID_PERMISSIONS.length];
    const isDangerous = DANGEROUS_PERMISSIONS.has(perm);
    const riskLevel: Severity = isDangerous
      ? pseudoRandom(i * 7) > 0.5
        ? "High"
        : "Critical"
      : pseudoRandom(i * 3) > 0.6
        ? "Medium"
        : "Low";
    return {
      name: perm,
      type: isDangerous ? "Dangerous" : "Normal",
      riskLevel,
    };
  });
}

export interface MockVulnerability {
  title: string;
  severity: Severity;
  description: string;
  file: string;
  line: number;
}

export function generateVulnerabilities(count: bigint): MockVulnerability[] {
  const n = Math.min(Number(count), VULNERABILITIES.length);
  return Array.from({ length: n }, (_, i) => {
    const v = VULNERABILITIES[i % VULNERABILITIES.length];
    const sevIdx = Math.floor(pseudoRandom(i * 11) * 4);
    return {
      ...v,
      severity: SEVERITIES[sevIdx],
      line: 10 + Math.floor(pseudoRandom(i * 13) * 200),
    };
  });
}

export interface NetworkLog {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  suspicious: boolean;
}

const SAMPLE_URLS = [
  "https://api.example.com/v1/user/profile",
  "https://analytics.tracker.net/event",
  "http://legacy.endpoint.com/data",
  "https://cdn.assets.net/images/logo.png",
  "https://suspicious-domain.ru/collect",
  "https://api.payment.com/charge",
  "https://graph.facebook.com/me",
  "https://crashlytics.google.com/report",
  "http://ads.network.com/bid",
  "https://api.maps.google.com/geocode",
];

export function generateNetworkLogs(seed: bigint): NetworkLog[] {
  const n = 15;
  const base = Number(seed % BigInt(1000000));
  const methods = [
    "GET",
    "POST",
    "POST",
    "GET",
    "GET",
    "PUT",
    "GET",
    "POST",
    "GET",
    "GET",
  ];
  const statuses = [200, 200, 201, 200, 403, 200, 200, 500, 200, 200];
  return Array.from({ length: n }, (_, i) => {
    const urlIdx = Math.floor(pseudoRandom(base + i * 7) * SAMPLE_URLS.length);
    const methodIdx = Math.floor(pseudoRandom(base + i * 3) * methods.length);
    const statusIdx = Math.floor(pseudoRandom(base + i * 5) * statuses.length);
    const url = SAMPLE_URLS[urlIdx];
    const isSuspicious =
      url.includes("suspicious") ||
      url.startsWith("http://") ||
      statuses[statusIdx] === 403;
    const mins = i * 2 + Math.floor(pseudoRandom(base + i) * 2);
    const time = new Date(Date.now() - mins * 60000);
    return {
      timestamp: time.toLocaleTimeString(),
      method: methods[methodIdx],
      url,
      statusCode: statuses[statusIdx],
      suspicious: isSuspicious,
    };
  });
}

export interface RuntimeBehavior {
  category: string;
  description: string;
  severity: Severity;
  timestamp: string;
}

const BEHAVIORS = [
  {
    category: "File System",
    description: "Accessed sensitive user documents directory",
    severity: "High" as Severity,
  },
  {
    category: "Clipboard",
    description: "Read clipboard contents without user interaction",
    severity: "High" as Severity,
  },
  {
    category: "Location",
    description: "Accessed precise GPS location in background",
    severity: "Critical" as Severity,
  },
  {
    category: "Contacts",
    description: "Enumerated all device contacts",
    severity: "High" as Severity,
  },
  {
    category: "Network",
    description: "Established connection to C2 server",
    severity: "Critical" as Severity,
  },
  {
    category: "Crypto",
    description: "Generated RSA key pair for data exfiltration",
    severity: "Medium" as Severity,
  },
  {
    category: "SMS",
    description: "Read SMS inbox without user prompt",
    severity: "Critical" as Severity,
  },
  {
    category: "Camera",
    description: "Accessed camera without visible UI",
    severity: "High" as Severity,
  },
  {
    category: "Audio",
    description: "Microphone recording initiated in background",
    severity: "Critical" as Severity,
  },
  {
    category: "Process",
    description: "Attempted privilege escalation",
    severity: "Critical" as Severity,
  },
];

export function generateRuntimeBehaviors(
  threatScore: bigint,
): RuntimeBehavior[] {
  const score = Number(threatScore);
  const n = Math.max(2, Math.floor((score / 100) * BEHAVIORS.length));
  return BEHAVIORS.slice(0, n).map((b, i) => {
    const mins = i * 3 + 1;
    return {
      ...b,
      timestamp: new Date(Date.now() - mins * 60000).toLocaleTimeString(),
    };
  });
}

export interface FlaggedBehavior {
  name: string;
  description: string;
  confidence: number;
  risk: Severity;
}

const MALWARE_BEHAVIORS = [
  {
    name: "Data Exfiltration",
    description: "Sending user data to remote server without consent",
    risk: "Critical" as Severity,
  },
  {
    name: "Remote Access Trojan",
    description: "Opens reverse shell allowing attacker remote control",
    risk: "Critical" as Severity,
  },
  {
    name: "Keylogger Activity",
    description: "Capturing keystrokes including passwords and PINs",
    risk: "Critical" as Severity,
  },
  {
    name: "Ad Fraud",
    description: "Clicking ads in background to generate fraudulent revenue",
    risk: "High" as Severity,
  },
  {
    name: "SMS Stealer",
    description: "Intercepting incoming SMS for OTP theft",
    risk: "Critical" as Severity,
  },
  {
    name: "Banking Trojan",
    description: "Overlaying banking apps to steal credentials",
    risk: "Critical" as Severity,
  },
  {
    name: "Spyware Module",
    description: "Periodically uploading location and contacts",
    risk: "High" as Severity,
  },
  {
    name: "Ransomware Component",
    description: "Encrypting user files with hardcoded key",
    risk: "Critical" as Severity,
  },
];

export function generateFlaggedBehaviors(
  threatScore: bigint,
): FlaggedBehavior[] {
  const score = Number(threatScore);
  const n = Math.max(1, Math.floor((score / 100) * MALWARE_BEHAVIORS.length));
  return MALWARE_BEHAVIORS.slice(0, n).map((b, i) => ({
    ...b,
    confidence: Math.round(60 + pseudoRandom(i * 17) * 35),
  }));
}

export interface DataLeakageRisk {
  type: string;
  severity: Severity;
  description: string;
  location: string;
}

const LEAKAGE_RISKS = [
  {
    type: "Location Data",
    severity: "Critical" as Severity,
    description: "GPS coordinates transmitted to third-party analytics SDK",
    location: "AnalyticsManager.java",
  },
  {
    type: "Device Identifier",
    severity: "High" as Severity,
    description: "IMEI and Android ID sent to advertising network",
    location: "DeviceInfo.java",
  },
  {
    type: "Contact Information",
    severity: "High" as Severity,
    description: "User contact list synced to remote server",
    location: "ContactSync.java",
  },
  {
    type: "Browsing History",
    severity: "Medium" as Severity,
    description: "WebView history accessible to all app components",
    location: "WebViewController.java",
  },
  {
    type: "Biometric Data",
    severity: "Critical" as Severity,
    description: "Fingerprint template stored in insecure database",
    location: "BiometricManager.java",
  },
  {
    type: "Financial Data",
    severity: "Critical" as Severity,
    description: "Credit card numbers logged in plaintext",
    location: "PaymentProcessor.java",
  },
  {
    type: "Authentication Tokens",
    severity: "High" as Severity,
    description: "Session tokens stored in SharedPreferences",
    location: "SessionManager.java",
  },
  {
    type: "Health Data",
    severity: "High" as Severity,
    description: "Medical history exported without encryption",
    location: "HealthDataExport.java",
  },
];

export function generateLeakageRisks(
  result: AnalysisResult,
): DataLeakageRisk[] {
  const n = Math.min(
    Number(result.permissionsCount) / 3 + Number(result.criticalCount),
    LEAKAGE_RISKS.length,
  );
  return LEAKAGE_RISKS.slice(0, Math.max(2, Math.round(n)));
}

export interface SensitiveAPI {
  name: string;
  usage: string;
  riskLevel: Severity;
  category: string;
}

const SENSITIVE_APIS = [
  {
    name: "TelephonyManager.getDeviceId()",
    usage: "Retrieves IMEI for device fingerprinting",
    riskLevel: "High" as Severity,
    category: "Device Info",
  },
  {
    name: "LocationManager.getLastKnownLocation()",
    usage: "Accesses cached GPS location data",
    riskLevel: "High" as Severity,
    category: "Location",
  },
  {
    name: "ContentResolver.query(ContactsContract)",
    usage: "Queries full contacts database",
    riskLevel: "High" as Severity,
    category: "Contacts",
  },
  {
    name: "AudioRecord.startRecording()",
    usage: "Initiates microphone capture",
    riskLevel: "Critical" as Severity,
    category: "Audio",
  },
  {
    name: "Camera.open()",
    usage: "Opens camera for background capture",
    riskLevel: "High" as Severity,
    category: "Camera",
  },
  {
    name: "SmsManager.sendTextMessage()",
    usage: "Sends SMS silently without user prompt",
    riskLevel: "Critical" as Severity,
    category: "SMS",
  },
  {
    name: 'Cipher.getInstance("DES")',
    usage: "Uses deprecated DES encryption",
    riskLevel: "Medium" as Severity,
    category: "Cryptography",
  },
  {
    name: "Runtime.exec()",
    usage: "Executes arbitrary shell commands",
    riskLevel: "Critical" as Severity,
    category: "Execution",
  },
  {
    name: "PackageManager.getInstalledApplications()",
    usage: "Enumerates all installed apps",
    riskLevel: "Medium" as Severity,
    category: "App Discovery",
  },
  {
    name: "Settings.Secure.getString(ANDROID_ID)",
    usage: "Accesses persistent Android identifier",
    riskLevel: "Medium" as Severity,
    category: "Device Info",
  },
];

export function generateSensitiveAPIs(
  permissionsCount: bigint,
): SensitiveAPI[] {
  const n = Math.min(
    Math.max(3, Number(permissionsCount) / 2),
    SENSITIVE_APIS.length,
  );
  return SENSITIVE_APIS.slice(0, Math.round(n));
}

export function generateNetworkTimeline(
  seed: bigint,
): { time: string; requests: number; suspicious: number }[] {
  const base = Number(seed % BigInt(1000));
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, "0")}:00`,
    requests: Math.floor(pseudoRandom(base + i * 7) * 40) + 5,
    suspicious: Math.floor(pseudoRandom(base + i * 13) * 8),
  }));
}

export function getRiskRating(threatScore: bigint): Severity {
  const score = Number(threatScore);
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  if (score >= 25) return "text-orange-600";
  return "text-red-600";
}
