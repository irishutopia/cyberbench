#!/usr/bin/env python3
"""Seed CyberBench database via Supabase REST API"""

import json
from urllib.request import Request, urlopen

SUPABASE_URL = "https://rsjvlljmswumgsymjmhy.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzanZsbGptc3d1bWdzeW1qbWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUxMjYyMCwiZXhwIjoyMDkzMDg4NjIwfQ.Hl3nrHguVBjf8cg-SGp8uyw_5vT9CBuy5mbJumR1s80"

def insert(table, rows):
    payload = json.dumps(rows).encode()
    req = Request(f"{SUPABASE_URL}/rest/v1/{table}", data=payload, headers={
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    })
    try:
        resp = urlopen(req, timeout=30)
        data = json.loads(resp.read())
        print(f"  ✅ {table}: {len(data)} rows inserted", flush=True)
        return data
    except Exception as e:
        body = getattr(e, "read", lambda: b"")()
        if isinstance(body, bytes): body = body.decode()[:300]
        print(f"  ❌ {table}: {e} {body}", flush=True)
        return []

# ============================================================
# SERVICE CATEGORIES
# ============================================================
print("Seeding service categories...", flush=True)
categories = [
    {"slug": "penetration-testing", "name": "Penetration Testing", "description": "Simulated cyberattacks to find vulnerabilities before attackers do.", "icon": "🎯", "sort_order": 1},
    {"slug": "managed-security", "name": "Managed Security Services (MSSP)", "description": "24/7 security monitoring, threat detection, and incident response.", "icon": "🛡️", "sort_order": 2},
    {"slug": "vciso", "name": "Virtual CISO (vCISO)", "description": "Fractional security leadership for organizations without a full-time CISO.", "icon": "👔", "sort_order": 3},
    {"slug": "incident-response", "name": "Incident Response", "description": "Emergency response to active breaches and security incidents.", "icon": "🚨", "sort_order": 4},
    {"slug": "compliance", "name": "Compliance & Audit", "description": "SOC 2, HIPAA, PCI DSS, ISO 27001, and regulatory compliance services.", "icon": "📋", "sort_order": 5},
    {"slug": "cloud-security", "name": "Cloud Security", "description": "Securing AWS, Azure, GCP environments and cloud-native applications.", "icon": "☁️", "sort_order": 6},
    {"slug": "vulnerability-management", "name": "Vulnerability Management", "description": "Continuous scanning, prioritization, and remediation of vulnerabilities.", "icon": "🔍", "sort_order": 7},
    {"slug": "security-awareness", "name": "Security Awareness Training", "description": "Employee training, phishing simulations, and security culture programs.", "icon": "🎓", "sort_order": 8},
    {"slug": "identity-access", "name": "Identity & Access Management", "description": "IAM, SSO, MFA, privileged access, and zero trust implementations.", "icon": "🔑", "sort_order": 9},
    {"slug": "network-security", "name": "Network Security", "description": "Firewalls, IDS/IPS, network segmentation, and perimeter defense.", "icon": "🌐", "sort_order": 10},
    {"slug": "endpoint-security", "name": "Endpoint Security", "description": "EDR, antivirus, device management, and endpoint protection platforms.", "icon": "💻", "sort_order": 11},
    {"slug": "application-security", "name": "Application Security", "description": "Secure SDLC, code review, SAST/DAST, and DevSecOps.", "icon": "📱", "sort_order": 12},
    {"slug": "data-protection", "name": "Data Protection & Privacy", "description": "DLP, encryption, data classification, and privacy compliance.", "icon": "🔒", "sort_order": 13},
    {"slug": "threat-intelligence", "name": "Threat Intelligence", "description": "Threat feeds, dark web monitoring, and intelligence-driven defense.", "icon": "🔭", "sort_order": 14},
    {"slug": "grc", "name": "Governance, Risk & Compliance (GRC)", "description": "Risk management frameworks, policy development, and governance programs.", "icon": "⚖️", "sort_order": 15},
    {"slug": "forensics", "name": "Digital Forensics", "description": "Evidence collection, analysis, and expert testimony for cyber incidents.", "icon": "🔬", "sort_order": 16},
    {"slug": "red-team", "name": "Red Team / Adversary Simulation", "description": "Advanced adversary simulation and full-scope attack exercises.", "icon": "🎭", "sort_order": 17},
    {"slug": "soc-as-service", "name": "SOC as a Service", "description": "Outsourced security operations center with 24/7 monitoring.", "icon": "📡", "sort_order": 18},
    {"slug": "ot-ics-security", "name": "OT/ICS Security", "description": "Securing operational technology, SCADA, and industrial control systems.", "icon": "🏭", "sort_order": 19},
    {"slug": "attack-surface", "name": "Attack Surface Management", "description": "Continuous discovery and monitoring of external-facing assets.", "icon": "🗺️", "sort_order": 20},
]
cat_data = insert("service_categories", categories)
cat_map = {c["slug"]: c["id"] for c in cat_data} if cat_data else {}

# ============================================================
# CERTIFICATIONS
# ============================================================
print("Seeding certifications...", flush=True)
certs = [
    {"slug": "soc2-type2", "name": "SOC 2 Type II", "issuing_body": "AICPA"},
    {"slug": "iso-27001", "name": "ISO 27001", "issuing_body": "ISO"},
    {"slug": "pci-dss", "name": "PCI DSS", "issuing_body": "PCI SSC"},
    {"slug": "hitrust", "name": "HITRUST CSF", "issuing_body": "HITRUST Alliance"},
    {"slug": "fedramp", "name": "FedRAMP", "issuing_body": "US Government"},
    {"slug": "cmmc", "name": "CMMC", "issuing_body": "US DoD"},
    {"slug": "crest", "name": "CREST", "issuing_body": "CREST International"},
    {"slug": "cissp", "name": "CISSP (Staff)", "issuing_body": "ISC2"},
]
cert_data = insert("certifications", certs)

# ============================================================
# PROVIDERS (50 real cybersecurity companies)
# ============================================================
print("Seeding providers...", flush=True)
providers = [
    {"slug": "crowdstrike", "name": "CrowdStrike", "description": "Global leader in cloud-delivered endpoint and workload protection. Known for the Falcon platform.", "website": "https://crowdstrike.com", "headquarters": "Austin, TX", "city": "Austin", "state": "Texas", "state_code": "TX", "employee_count": "5000+", "founded_year": 2011, "status": "active"},
    {"slug": "palo-alto-networks", "name": "Palo Alto Networks", "description": "Comprehensive cybersecurity platform covering network, cloud, and endpoint security.", "website": "https://paloaltonetworks.com", "headquarters": "Santa Clara, CA", "city": "Santa Clara", "state": "California", "state_code": "CA", "employee_count": "10000+", "founded_year": 2005, "status": "active"},
    {"slug": "rapid7", "name": "Rapid7", "description": "Security analytics and automation for vulnerability management, detection and response.", "website": "https://rapid7.com", "headquarters": "Boston, MA", "city": "Boston", "state": "Massachusetts", "state_code": "MA", "employee_count": "2000-5000", "founded_year": 2000, "status": "active"},
    {"slug": "knowbe4", "name": "KnowBe4", "description": "World's largest security awareness training and simulated phishing platform.", "website": "https://knowbe4.com", "headquarters": "Clearwater, FL", "city": "Clearwater", "state": "Florida", "state_code": "FL", "employee_count": "1000-2000", "founded_year": 2010, "status": "active"},
    {"slug": "coalfire", "name": "Coalfire", "description": "Cybersecurity advisory and assessment firm specializing in compliance and risk management.", "website": "https://coalfire.com", "headquarters": "Denver, CO", "city": "Denver", "state": "Colorado", "state_code": "CO", "employee_count": "500-1000", "founded_year": 2001, "status": "active"},
    {"slug": "optiv", "name": "Optiv Security", "description": "End-to-end cybersecurity solutions provider and systems integrator.", "website": "https://optiv.com", "headquarters": "Denver, CO", "city": "Denver", "state": "Colorado", "state_code": "CO", "employee_count": "2000-5000", "founded_year": 2015, "status": "active"},
    {"slug": "bishop-fox", "name": "Bishop Fox", "description": "Offensive security firm specializing in penetration testing and red team operations.", "website": "https://bishopfox.com", "headquarters": "Tempe, AZ", "city": "Tempe", "state": "Arizona", "state_code": "AZ", "employee_count": "200-500", "founded_year": 2005, "status": "active"},
    {"slug": "secureworks", "name": "Secureworks", "description": "Managed detection and response (MDR) and threat intelligence services.", "website": "https://secureworks.com", "headquarters": "Atlanta, GA", "city": "Atlanta", "state": "Georgia", "state_code": "GA", "employee_count": "2000-5000", "founded_year": 1999, "status": "active"},
    {"slug": "arctic-wolf", "name": "Arctic Wolf", "description": "Security operations platform delivering managed detection and response.", "website": "https://arcticwolf.com", "headquarters": "Eden Prairie, MN", "city": "Eden Prairie", "state": "Minnesota", "state_code": "MN", "employee_count": "1000-2000", "founded_year": 2012, "status": "active"},
    {"slug": "sentinelone", "name": "SentinelOne", "description": "AI-powered autonomous endpoint protection, detection, and response.", "website": "https://sentinelone.com", "headquarters": "Mountain View, CA", "city": "Mountain View", "state": "California", "state_code": "CA", "employee_count": "2000-5000", "founded_year": 2013, "status": "active"},
    {"slug": "netspi", "name": "NetSPI", "description": "Proactive security testing and attack surface management.", "website": "https://netspi.com", "headquarters": "Minneapolis, MN", "city": "Minneapolis", "state": "Minnesota", "state_code": "MN", "employee_count": "200-500", "founded_year": 2001, "status": "active"},
    {"slug": "trustwave", "name": "Trustwave", "description": "Managed security services, consulting, and threat detection.", "website": "https://trustwave.com", "headquarters": "Chicago, IL", "city": "Chicago", "state": "Illinois", "state_code": "IL", "employee_count": "1000-2000", "founded_year": 1995, "status": "active"},
    {"slug": "tenable", "name": "Tenable", "description": "Exposure management platform for vulnerability assessment and cyber risk.", "website": "https://tenable.com", "headquarters": "Columbia, MD", "city": "Columbia", "state": "Maryland", "state_code": "MD", "employee_count": "1000-2000", "founded_year": 2002, "status": "active"},
    {"slug": "proofpoint", "name": "Proofpoint", "description": "Email security, data loss prevention, and security awareness training.", "website": "https://proofpoint.com", "headquarters": "Sunnyvale, CA", "city": "Sunnyvale", "state": "California", "state_code": "CA", "employee_count": "2000-5000", "founded_year": 2002, "status": "active"},
    {"slug": "mandiant", "name": "Mandiant (Google Cloud)", "description": "Incident response, threat intelligence, and security validation.", "website": "https://mandiant.com", "headquarters": "Reston, VA", "city": "Reston", "state": "Virginia", "state_code": "VA", "employee_count": "2000-5000", "founded_year": 2004, "status": "active"},
    {"slug": "cyberark", "name": "CyberArk", "description": "Identity security and privileged access management leader.", "website": "https://cyberark.com", "headquarters": "Newton, MA", "city": "Newton", "state": "Massachusetts", "state_code": "MA", "employee_count": "2000-5000", "founded_year": 1999, "status": "active"},
    {"slug": "varonis", "name": "Varonis", "description": "Data security and analytics platform for insider threats and data protection.", "website": "https://varonis.com", "headquarters": "New York, NY", "city": "New York", "state": "New York", "state_code": "NY", "employee_count": "1000-2000", "founded_year": 2005, "status": "active"},
    {"slug": "qualys", "name": "Qualys", "description": "Cloud-based vulnerability management, compliance, and web app security.", "website": "https://qualys.com", "headquarters": "Foster City, CA", "city": "Foster City", "state": "California", "state_code": "CA", "employee_count": "1000-2000", "founded_year": 1999, "status": "active"},
    {"slug": "deepwatch", "name": "Deepwatch", "description": "Managed detection and response platform for enterprise security teams.", "website": "https://deepwatch.com", "headquarters": "Tampa, FL", "city": "Tampa", "state": "Florida", "state_code": "FL", "employee_count": "200-500", "founded_year": 2019, "status": "active"},
    {"slug": "bugcrowd", "name": "Bugcrowd", "description": "Crowdsourced security testing including bug bounty and pen test programs.", "website": "https://bugcrowd.com", "headquarters": "San Francisco, CA", "city": "San Francisco", "state": "California", "state_code": "CA", "employee_count": "200-500", "founded_year": 2012, "status": "active"},
    {"slug": "cobalt", "name": "Cobalt", "description": "Pentest as a Service (PtaaS) platform connecting companies with vetted pentesters.", "website": "https://cobalt.io", "headquarters": "San Francisco, CA", "city": "San Francisco", "state": "California", "state_code": "CA", "employee_count": "200-500", "founded_year": 2013, "status": "active"},
    {"slug": "ncc-group", "name": "NCC Group", "description": "Global cybersecurity consulting, managed services, and software assurance.", "website": "https://nccgroup.com", "headquarters": "New York, NY", "city": "New York", "state": "New York", "state_code": "NY", "employee_count": "2000-5000", "founded_year": 1999, "status": "active"},
    {"slug": "kudelski-security", "name": "Kudelski Security", "description": "Cybersecurity advisory, managed services, and custom solutions.", "website": "https://kudelskisecurity.com", "headquarters": "Phoenix, AZ", "city": "Phoenix", "state": "Arizona", "state_code": "AZ", "employee_count": "200-500", "founded_year": 2012, "status": "active"},
    {"slug": "expel", "name": "Expel", "description": "Managed detection and response with transparent security operations.", "website": "https://expel.com", "headquarters": "Herndon, VA", "city": "Herndon", "state": "Virginia", "state_code": "VA", "employee_count": "500-1000", "founded_year": 2016, "status": "active"},
    {"slug": "critical-start", "name": "Critical Start", "description": "Managed detection and response (MDR) with zero-trust analytics.", "website": "https://criticalstart.com", "headquarters": "Plano, TX", "city": "Plano", "state": "Texas", "state_code": "TX", "employee_count": "200-500", "founded_year": 2012, "status": "active"},
    {"slug": "blumira", "name": "Blumira", "description": "Automated SIEM and XDR platform for mid-market security teams.", "website": "https://blumira.com", "headquarters": "Ann Arbor, MI", "city": "Ann Arbor", "state": "Michigan", "state_code": "MI", "employee_count": "50-200", "founded_year": 2018, "status": "active"},
    {"slug": "huntress", "name": "Huntress", "description": "Managed security platform for SMBs and their MSP partners.", "website": "https://huntress.com", "headquarters": "Baltimore, MD", "city": "Baltimore", "state": "Maryland", "state_code": "MD", "employee_count": "500-1000", "founded_year": 2015, "status": "active"},
    {"slug": "sophos", "name": "Sophos", "description": "Next-gen cybersecurity protecting networks, endpoints, and cloud.", "website": "https://sophos.com", "headquarters": "Burlington, MA", "city": "Burlington", "state": "Massachusetts", "state_code": "MA", "employee_count": "2000-5000", "founded_year": 1985, "status": "active"},
    {"slug": "fortinet", "name": "Fortinet", "description": "Comprehensive security platform including firewalls, SD-WAN, and SASE.", "website": "https://fortinet.com", "headquarters": "Sunnyvale, CA", "city": "Sunnyvale", "state": "California", "state_code": "CA", "employee_count": "10000+", "founded_year": 2000, "status": "active"},
    {"slug": "check-point", "name": "Check Point Software", "description": "Network security, cloud security, and threat prevention solutions.", "website": "https://checkpoint.com", "headquarters": "San Carlos, CA", "city": "San Carlos", "state": "California", "state_code": "CA", "employee_count": "5000+", "founded_year": 1993, "status": "active"},
    {"slug": "a-lign", "name": "A-LIGN", "description": "Compliance and cybersecurity audit firm (SOC 2, HITRUST, PCI, ISO).", "website": "https://a-lign.com", "headquarters": "Tampa, FL", "city": "Tampa", "state": "Florida", "state_code": "FL", "employee_count": "500-1000", "founded_year": 2009, "status": "active"},
    {"slug": "schellman", "name": "Schellman", "description": "Global independent cybersecurity assessor for SOC, ISO, PCI, FedRAMP.", "website": "https://schellman.com", "headquarters": "Tampa, FL", "city": "Tampa", "state": "Florida", "state_code": "FL", "employee_count": "200-500", "founded_year": 2003, "status": "active"},
    {"slug": "offensive-security", "name": "Offensive Security (OffSec)", "description": "Creators of Kali Linux, OSCP certification, and pen testing training.", "website": "https://offsec.com", "headquarters": "New York, NY", "city": "New York", "state": "New York", "state_code": "NY", "employee_count": "200-500", "founded_year": 2007, "status": "active"},
    {"slug": "dragos", "name": "Dragos", "description": "Industrial cybersecurity for OT/ICS environments and critical infrastructure.", "website": "https://dragos.com", "headquarters": "Hanover, MD", "city": "Hanover", "state": "Maryland", "state_code": "MD", "employee_count": "500-1000", "founded_year": 2016, "status": "active"},
    {"slug": "claroty", "name": "Claroty", "description": "Cyber-physical systems security for industrial, healthcare, and enterprise.", "website": "https://claroty.com", "headquarters": "New York, NY", "city": "New York", "state": "New York", "state_code": "NY", "employee_count": "500-1000", "founded_year": 2015, "status": "active"},
    {"slug": "snyk", "name": "Snyk", "description": "Developer-first security for finding and fixing vulnerabilities in code and dependencies.", "website": "https://snyk.io", "headquarters": "Boston, MA", "city": "Boston", "state": "Massachusetts", "state_code": "MA", "employee_count": "1000-2000", "founded_year": 2015, "status": "active"},
    {"slug": "veracode", "name": "Veracode", "description": "Application security testing including SAST, DAST, and SCA.", "website": "https://veracode.com", "headquarters": "Burlington, MA", "city": "Burlington", "state": "Massachusetts", "state_code": "MA", "employee_count": "1000-2000", "founded_year": 2006, "status": "active"},
    {"slug": "synopsys", "name": "Synopsys Software Integrity", "description": "Application security and quality solutions for the software supply chain.", "website": "https://synopsys.com", "headquarters": "Mountain View, CA", "city": "Mountain View", "state": "California", "state_code": "CA", "employee_count": "10000+", "founded_year": 1986, "status": "active"},
    {"slug": "keeper-security", "name": "Keeper Security", "description": "Enterprise password management, secrets management, and zero-trust PAM.", "website": "https://keepersecurity.com", "headquarters": "Chicago, IL", "city": "Chicago", "state": "Illinois", "state_code": "IL", "employee_count": "200-500", "founded_year": 2011, "status": "active"},
    {"slug": "okta", "name": "Okta", "description": "Identity and access management platform for workforce and customer identity.", "website": "https://okta.com", "headquarters": "San Francisco, CA", "city": "San Francisco", "state": "California", "state_code": "CA", "employee_count": "5000+", "founded_year": 2009, "status": "active"},
    {"slug": "sailpoint", "name": "SailPoint", "description": "Identity governance and administration for enterprise security.", "website": "https://sailpoint.com", "headquarters": "Austin, TX", "city": "Austin", "state": "Texas", "state_code": "TX", "employee_count": "2000-5000", "founded_year": 2005, "status": "active"},
    {"slug": "black-hills-infosec", "name": "Black Hills Information Security", "description": "Penetration testing, threat hunting, and security training.", "website": "https://blackhillsinfosec.com", "headquarters": "Spearfish, SD", "city": "Spearfish", "state": "South Dakota", "state_code": "SD", "employee_count": "50-200", "founded_year": 2008, "status": "active"},
    {"slug": "guardicore", "name": "Akamai Guardicore", "description": "Microsegmentation and zero-trust network security.", "website": "https://akamai.com", "headquarters": "Cambridge, MA", "city": "Cambridge", "state": "Massachusetts", "state_code": "MA", "employee_count": "5000+", "founded_year": 2014, "status": "active"},
    {"slug": "splunk", "name": "Splunk (Cisco)", "description": "Security information and event management (SIEM) and observability platform.", "website": "https://splunk.com", "headquarters": "San Francisco, CA", "city": "San Francisco", "state": "California", "state_code": "CA", "employee_count": "5000+", "founded_year": 2003, "status": "active"},
    {"slug": "elastic-security", "name": "Elastic Security", "description": "Open SIEM and security analytics built on the Elastic Stack.", "website": "https://elastic.co/security", "headquarters": "San Francisco, CA", "city": "San Francisco", "state": "California", "state_code": "CA", "employee_count": "2000-5000", "founded_year": 2012, "status": "active"},
    {"slug": "wiz", "name": "Wiz", "description": "Cloud security posture management and vulnerability detection for cloud environments.", "website": "https://wiz.io", "headquarters": "New York, NY", "city": "New York", "state": "New York", "state_code": "NY", "employee_count": "1000-2000", "founded_year": 2020, "status": "active"},
    {"slug": "abnormal-security", "name": "Abnormal Security", "description": "AI-powered email security platform protecting against advanced email attacks.", "website": "https://abnormalsecurity.com", "headquarters": "San Francisco, CA", "city": "San Francisco", "state": "California", "state_code": "CA", "employee_count": "500-1000", "founded_year": 2019, "status": "active"},
    {"slug": "viso-group", "name": "VISO Group", "description": "External attack surface management and virtual CISO services for mid-market companies. Creators of ThreatScope.", "website": "https://viso.group", "headquarters": "Houston, TX", "city": "Houston", "state": "Texas", "state_code": "TX", "employee_count": "1-50", "founded_year": 2025, "status": "active"},
    {"slug": "censys", "name": "Censys", "description": "Attack surface management through internet-wide scanning and discovery.", "website": "https://censys.com", "headquarters": "Ann Arbor, MI", "city": "Ann Arbor", "state": "Michigan", "state_code": "MI", "employee_count": "200-500", "founded_year": 2017, "status": "active"},
    {"slug": "recorded-future", "name": "Recorded Future", "description": "Real-time threat intelligence powered by machine learning and NLP.", "website": "https://recordedfuture.com", "headquarters": "Boston, MA", "city": "Boston", "state": "Massachusetts", "state_code": "MA", "employee_count": "1000-2000", "founded_year": 2009, "status": "active"},
]
prov_data = insert("providers", providers)
prov_map = {p["slug"]: p["id"] for p in prov_data} if prov_data else {}

# ============================================================
# PROVIDER <-> CATEGORY MAPPINGS
# ============================================================
if prov_map and cat_map:
    print("Seeding provider-category mappings...", flush=True)
    mappings = [
        ("crowdstrike", ["endpoint-security", "managed-security", "threat-intelligence"], "endpoint-security"),
        ("palo-alto-networks", ["network-security", "cloud-security", "endpoint-security"], "network-security"),
        ("rapid7", ["vulnerability-management", "penetration-testing", "managed-security"], "vulnerability-management"),
        ("knowbe4", ["security-awareness"], "security-awareness"),
        ("coalfire", ["compliance", "grc", "cloud-security"], "compliance"),
        ("optiv", ["managed-security", "identity-access", "grc"], "managed-security"),
        ("bishop-fox", ["penetration-testing", "red-team", "application-security"], "penetration-testing"),
        ("secureworks", ["managed-security", "threat-intelligence", "incident-response"], "managed-security"),
        ("arctic-wolf", ["managed-security", "soc-as-service", "vulnerability-management"], "managed-security"),
        ("sentinelone", ["endpoint-security", "cloud-security", "threat-intelligence"], "endpoint-security"),
        ("netspi", ["penetration-testing", "attack-surface", "red-team"], "penetration-testing"),
        ("trustwave", ["managed-security", "compliance", "penetration-testing"], "managed-security"),
        ("tenable", ["vulnerability-management", "attack-surface", "cloud-security"], "vulnerability-management"),
        ("proofpoint", ["security-awareness", "data-protection", "endpoint-security"], "security-awareness"),
        ("mandiant", ["incident-response", "threat-intelligence", "red-team"], "incident-response"),
        ("cyberark", ["identity-access", "data-protection"], "identity-access"),
        ("varonis", ["data-protection", "threat-intelligence", "compliance"], "data-protection"),
        ("qualys", ["vulnerability-management", "compliance", "cloud-security"], "vulnerability-management"),
        ("deepwatch", ["managed-security", "soc-as-service"], "managed-security"),
        ("bugcrowd", ["penetration-testing", "vulnerability-management"], "penetration-testing"),
        ("cobalt", ["penetration-testing", "application-security"], "penetration-testing"),
        ("ncc-group", ["penetration-testing", "compliance", "incident-response"], "penetration-testing"),
        ("kudelski-security", ["managed-security", "vciso", "compliance"], "managed-security"),
        ("expel", ["managed-security", "soc-as-service", "incident-response"], "managed-security"),
        ("critical-start", ["managed-security", "soc-as-service"], "managed-security"),
        ("blumira", ["managed-security", "soc-as-service"], "managed-security"),
        ("huntress", ["managed-security", "endpoint-security"], "managed-security"),
        ("sophos", ["endpoint-security", "network-security", "managed-security"], "endpoint-security"),
        ("fortinet", ["network-security", "endpoint-security", "cloud-security"], "network-security"),
        ("check-point", ["network-security", "cloud-security", "endpoint-security"], "network-security"),
        ("a-lign", ["compliance", "grc"], "compliance"),
        ("schellman", ["compliance", "grc"], "compliance"),
        ("offensive-security", ["penetration-testing", "red-team", "security-awareness"], "penetration-testing"),
        ("dragos", ["ot-ics-security", "incident-response", "threat-intelligence"], "ot-ics-security"),
        ("claroty", ["ot-ics-security", "network-security"], "ot-ics-security"),
        ("snyk", ["application-security"], "application-security"),
        ("veracode", ["application-security", "compliance"], "application-security"),
        ("synopsys", ["application-security"], "application-security"),
        ("keeper-security", ["identity-access", "data-protection"], "identity-access"),
        ("okta", ["identity-access"], "identity-access"),
        ("sailpoint", ["identity-access", "grc"], "identity-access"),
        ("black-hills-infosec", ["penetration-testing", "red-team", "security-awareness"], "penetration-testing"),
        ("guardicore", ["network-security", "cloud-security"], "network-security"),
        ("splunk", ["managed-security", "soc-as-service", "threat-intelligence"], "managed-security"),
        ("elastic-security", ["managed-security", "soc-as-service"], "managed-security"),
        ("wiz", ["cloud-security", "vulnerability-management"], "cloud-security"),
        ("abnormal-security", ["endpoint-security", "data-protection"], "endpoint-security"),
        ("viso-group", ["attack-surface", "vciso", "vulnerability-management"], "attack-surface"),
        ("censys", ["attack-surface", "threat-intelligence"], "attack-surface"),
        ("recorded-future", ["threat-intelligence", "managed-security"], "threat-intelligence"),
    ]
    
    rows = []
    for prov_slug, cat_slugs, primary_slug in mappings:
        if prov_slug in prov_map:
            for cat_slug in cat_slugs:
                if cat_slug in cat_map:
                    rows.append({
                        "provider_id": prov_map[prov_slug],
                        "category_id": cat_map[cat_slug],
                        "is_primary": cat_slug == primary_slug
                    })
    insert("provider_services", rows)

# ============================================================
# RLS POLICIES (enable public read)
# ============================================================
print("\nNote: RLS is enabled. You'll need to add read policies in Supabase dashboard:", flush=True)
print("  ALTER POLICY or create: SELECT for anon on providers, service_categories, certifications, provider_services, cities", flush=True)

print("\n=== Seeding complete! ===", flush=True)
