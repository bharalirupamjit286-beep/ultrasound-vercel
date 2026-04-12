
    document.addEventListener('DOMContentLoaded', () => {
      const $ = (id) => document.getElementById(id);
      const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
      const setHtml = (id, value) => { const el = $(id); if (el) el.innerHTML = value; };

      const crlPoints = [45, 50, 55, 60, 65, 70, 75, 80, 84];
      const ntExpectedCurve = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
      const ntP95Curve = [2.1, 2.2, 2.3, 2.4, 2.55, 2.7, 2.85, 3.0, 3.1];
      const ntP99Curve = [2.8, 2.9, 3.0, 3.1, 3.25, 3.4, 3.55, 3.7, 3.8];
      const WEEKLY_REFERENCE = {
        18: { bpd: 42, hc: 160, ac: 137, fl: 28, efw: 220 },
        20: { bpd: 47, hc: 177, ac: 150, fl: 32, efw: 330 },
        22: { bpd: 53, hc: 198, ac: 171, fl: 37, efw: 460 },
        24: { bpd: 59, hc: 219, ac: 191, fl: 42, efw: 650 },
        26: { bpd: 65, hc: 240, ac: 218, fl: 48, efw: 900 },
        28: { bpd: 72, hc: 260, ac: 245, fl: 52, efw: 1200 },
        30: { bpd: 78, hc: 280, ac: 270, fl: 57, efw: 1550 },
        32: { bpd: 82, hc: 295, ac: 285, fl: 61, efw: 1900 },
        34: { bpd: 86, hc: 310, ac: 305, fl: 65, efw: 2300 },
        36: { bpd: 90, hc: 325, ac: 325, fl: 69, efw: 2750 }
      };
      const PERCENTILE_TOLERANCE = { bpd: 0.055, hc: 0.05, ac: 0.06, fl: 0.06, efw: 0.18 };
      const BRAND_TEMPLATES = {
        custom: null,
        microlab: { clinic: 'Microlab Fetal Imaging Centre', tagline: 'Obstetric Ultrasound • Fetal Medicine • Advanced Screening', prefix: 'MICRO', address: 'Microlab Women Imaging Wing, Main City Branch', contact: '+91 11111 11111 | microlab@example.com', website: 'www.microlab-example.com', consultant: 'Dr Consultant Name, MD Radiodiagnosis', registration: 'Reg. No: MIC-001', logo: 'ML' },
        aditya: { clinic: 'Aditya Diagnostics - Fetal Medicine Unit', tagline: 'Premium Prenatal Imaging • Anomaly Scan • Doppler', prefix: 'ADI', address: 'Aditya Diagnostics, Obstetric Imaging Division', contact: '+91 22222 22222 | aditya@example.com', website: 'www.aditya-example.com', consultant: 'Dr Consultant Name, MD Radiodiagnosis', registration: 'Reg. No: ADI-002', logo: 'AD' },
        other: { clinic: 'Other Diagnostic & Fetal Care Centre', tagline: 'Structured Obstetric Reporting • Screening • Follow-up', prefix: 'OTH', address: 'Specialty Imaging Branch', contact: '+91 33333 33333 | info@other-example.com', website: 'www.other-example.com', consultant: 'Dr Consultant Name, MD Radiodiagnosis', registration: 'Reg. No: OTH-003', logo: 'OT' }
      };
      const CENTER_STORAGE_KEY = 'astraia_like_nt_mvp_v62_centers';
      const ACTIVE_CENTER_SESSION_KEY = 'astraia_like_nt_mvp_v62_center_session';
      const SUPER_ADMIN_SESSION_KEY = 'astraia_like_nt_mvp_v62_super_admin_session';
      const SUPER_ADMIN_PIN = 'owner123';
      const PREMIUM_FEATURE_KEYS = ['monthlyReports', 'whatsappShare', 'patientMaster'];
      const LEGACY_REPORT_STORAGE_KEY = 'astraia_like_nt_mvp_v62_saved_reports';
      const REPORT_STORAGE_KEY_PREFIX = 'astraia_like_nt_mvp_v62_saved_reports';
      const FORMF_STORAGE_KEY_PREFIX = 'astraia_like_nt_mvp_v62_formf_records';
      const RECEPTION_STORAGE_KEY_PREFIX = 'astraia_like_nt_mvp_v62_reception_entries';
      const PRINT_ASSET_STORAGE_KEY = 'astraia_like_nt_mvp_v62_print_assets';
      const BACKEND_CONFIG_STORAGE_KEY = 'astraia_like_nt_mvp_v62_backend_config';
      const ROLE_DEFINITIONS = {
        admin: { label: 'Admin', permissions: ['editClinical','finalize','amend','manageCenter','manageBranch','duplicate','deleteReport','backup','print'] },
        consultant: { label: 'Consultant', permissions: ['editClinical','finalize','amend','duplicate','print'] },
        sonologist: { label: 'Sonologist / Operator', permissions: ['editClinical','amend','duplicate','print'] },
        viewer: { label: 'Reception / Viewer', permissions: ['print'] }
      };
      const BRANDING_FIELD_IDS = ['brandClinicName','brandTagline','brandReportPrefix','brandBranchName','brandAddress','brandContact','brandWebsite','brandConsultant','brandRegistration','brandLogoText','brandTemplate'];
      const REPORT_PRINT_META_KEYS = [
        { status: 'ntPrintStatus', version: 'ntPrintVersion', note: 'ntPrintAmendment' },
        { status: 'l2PrintStatus', version: 'l2PrintVersion', note: 'l2PrintAmendment' },
        { status: 'bPrintStatus', version: 'bPrintVersion', note: 'bPrintAmendment' },
        { status: 'oPrintStatus', version: 'oPrintVersion', note: 'oPrintAmendment' },
        { status: 'tPrintStatus', version: 'tPrintVersion', note: 'tPrintAmendment' }
      ];
      const REPORT_EXCLUDED_IDS = new Set([
        'centerLoginSelect', 'centerPassword', 'centerBranchSelector', 'centerUserName', 'centerRoleSelect',
        'newBranchName', 'toggleBrandingGlobal', 'importBackupInput', 'newVisitTargetTab', 'newVisitCarryMode',
        'patientMasterSearch', 'patientMasterSort', 'settingEnableDoctorSignature', 'settingEnableCenterLabels', 'settingEnableMonthlyReports', 'settingEnableKyc', 'settingEnablePayments', 'settingEnableWhatsappShare', 'settingEnablePatientMaster', 'settingKycOwnerName', 'settingKycBusinessName', 'settingKycRegistrationId', 'settingKycTaxId', 'settingKycBillingEmail', 'settingKycBillingPhone', 'settingKycStatus', 'settingPaymentPlan', 'settingMonthlyFee', 'settingPaymentStatus', 'settingBillingDay', 'settingLastPaidOn', 'settingNextDueOn', 'settingPaymentReference'
      ]);
      const TAB_FORM_FIELD_IDS = {
        nt: ['patientName','patientId','maternalAge','lmp','scanDate','referringDoctor','indication','crl','nt','nasalBone','dvFlow','tricuspid','fhr','placenta','liquor','otherFindings'],
        level2: ['l2PatientName','l2PatientId','l2MaternalAge','l2ScanDate','l2ReferringDoctor','l2Indication','l2GaWeeks','l2GaDays','l2Bpd','l2Hc','l2Ac','l2Fl','l2Efw','l2Fhr','l2SmEif','l2SmCpc','l2SmPyelectasis','l2SmEchogenicBowel','l2SmShortFemur','l2SmSua','l2SmMildVent','l2SmNasalBoneHypo','l2SmNuchalFold','l2SoftMarkerNote','l2Brain','l2BrainDetail','l2Face','l2FaceDetail','l2Spine','l2SpineDetail','l2Heart4','l2Heart4Detail','l2Outflow','l2OutflowDetail','l2Abdomen','l2AbdomenDetail','l2Renal','l2RenalDetail','l2UpperLimb','l2UpperLimbDetail','l2LowerLimb','l2LowerLimbDetail','l2OtherFindings','l2McaPi','l2UaPi','l2UtPi','l2Placenta','l2Liquor','l2Cervix'],
        biometry: ['bPatientName','bPatientId','bMaternalAge','bScanDate','bReferringDoctor','bIndication','bGaWeeks','bGaDays','bBpd','bHc','bAc','bFl','bEfw','bFhr','bPresentation','bPlacenta','bLiquor','bComment'],
        obdoppler: ['oPatientName','oPatientId','oMaternalAge','oScanDate','oReferringDoctor','oIndication','oGaWeeks','oGaDays','oBpd','oHc','oAc','oFl','oEfw','oFhr','oMcaPi','oUaPi','oPresentation','oPlacenta','oLiquor','oComment'],
        twins: ['tPatientName','tPatientId','tMaternalAge','tScanDate','tReferringDoctor','tIndication','tGaWeeks','tGaDays','tChorionicity','tAPresentation','tBPresentation','tPlacenta','tABpd','tAHc','tAAc','tAFl','tAEfw','tALiquor','tBBpd','tBHc','tBAc','tBFl','tBEfw','tBLiquor','tComment']
      };
      const FORMF_FIELD_IDS = ['formFRecordId','formFLinkedReportPublicId','formFStatus','formFClinicAddress','formFClinicRegNo','formFPatientName','formFPatientId','formFPatientAge','formFTotalLivingChildren','formFLivingSonsDetail','formFLivingDaughtersDetail','formFRelativeName','formFPatientAddress','formFPatientPhone','formFReferredBy','formFSelfReferral','formFLmp','formFScanDate','formFGaWeeks','formFGaDays','formFGravida','formFPara','formFLiving','formFAbortions','formFMaleChildren','formFFemaleChildren','formFDoctorName','formFReferralRegNo','formFProcedureType','formFProcedureOther','formFIndication','formFClinicalSummary','formFDeclarationDate','formFResultConveyedTo','formFResultConveyedOn','formFMtpIndication','formFCentreName','formFConsultantName','formFConsultantReg','formFPatientDeclarationName','formFPatientDeclarationProcedure','formFDeclaration'];
      const RECEPTION_FIELD_IDS = ['receptionRecordId','receptionTokenNo','receptionReceiptNo','receptionPatientName','receptionPatientId','receptionAge','receptionPhone','receptionRelativeName','receptionAppointmentDate','receptionScanType','receptionQueueStatus','receptionPaymentStatus','receptionAmount','receptionAmountPaid','receptionBalance','receptionReferringDoctor','receptionAddress','receptionIndication','receptionNotes','receptionSearch','receptionStatusFilter'];
      RECEPTION_FIELD_IDS.forEach((id) => REPORT_EXCLUDED_IDS.add(id));

      let currentLoadedReportId = null;
      let currentLoadedReceptionId = null;
      let currentLoadedFormFId = null;
      let selectedPatientMasterKey = null;
      let selectedSuperAdminCenterId = '__new__';
      let currentEditMode = 'normal';
      let initialTabDefaults = {};
      let ntChart, riskCurveChart, level2Chart, growthChart, l2SoftMarkerRiskChart, biometryChart, obDopplerChart, twinsChart, patientGrowthTrendChart, patientDopplerTrendChart;
      let backendAutoSyncTimer = null;

      function makeBadge(label, tone) { return `<span class="risk-badge ${tone}"><span class="risk-dot"></span>${label}</span>`; }
      function titleCase(str) { return String(str).split(' ').map(s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '').join(' '); }
      function formatDate(val) { if (!val) return '-'; const d = new Date(val); return Number.isNaN(d.getTime()) ? val : d.toLocaleDateString('en-GB'); }
      function formatNowStamp() { const now = new Date(); return now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
      function buildReportId(prefix, suffix, patientId, scanDate) {
        const cleanId = (patientId || '0001').toString().replace(/[^A-Za-z0-9]/g, '').slice(-6) || '0001';
        const cleanDate = scanDate ? scanDate.replace(/-/g, '') : new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${prefix}-${suffix}-${cleanDate}-${cleanId}`;
      }
      function sanitizeSerialCode(value, maxLength = 4) {
        const text = String(value || '').toUpperCase();
        let clean = '';
        for (const ch of text) {
          const isLetter = ch >= 'A' && ch <= 'Z';
          const isDigit = ch >= '0' && ch <= '9';
          if (isLetter || isDigit) clean += ch;
          if (clean.length >= maxLength) break;
        }
        return clean || 'NA';
      }
      function padSerial(value, size = 4) {
        return String(Number(value || 0)).padStart(size, '0');
      }
      function getBranchSerialCode() {
        return sanitizeSerialCode($('brandBranchName')?.value || getCurrentBranch()?.name || 'BR', 3);
      }
      function getReportTypeCode(reportType) {
        return { nt: 'NT', level2: 'L2', biometry: 'BIO', obdoppler: 'OBD', twins: 'TWN' }[reportType] || 'RPT';
      }
      function getMonthKeyFromValue(value) {
        const candidate = String(value || '').slice(0, 10);
        const parsed = parseIsoDate(candidate);
        const date = parsed || new Date(candidate || Date.now());
        const year = date.getUTCFullYear ? date.getUTCFullYear() : date.getFullYear();
        const month = (date.getUTCMonth ? date.getUTCMonth() : date.getMonth()) + 1;
        return `${year}${String(month).padStart(2, '0')}`;
      }
      function getActiveScanDateForTab(reportType = getActiveTabName()) {
        const fieldId = getTabDateFieldId(reportType);
        return $(fieldId)?.value || new Date().toISOString().slice(0, 10);
      }
      function extractScanDateFromReportState(reportType, state = {}) {
        const fieldId = getTabDateFieldId(reportType);
        return state?.[fieldId] || '';
      }
      function getReportMonthKey(report) {
        const latest = report?.versions?.[report.versions.length - 1] || {};
        return report?.serialMonth || getMonthKeyFromValue(extractScanDateFromReportState(latest.activeTab || report?.reportType || 'nt', latest.state || {}) || report?.updatedAt || report?.createdAt || new Date().toISOString().slice(0, 10));
      }
      function getFormFMonthKey(record) {
        return record?.serialMonth || getMonthKeyFromValue(record?.data?.formFScanDate || record?.updatedAt || record?.createdAt || new Date().toISOString().slice(0, 10));
      }
      function buildReportPublicId(reportType, scanDate, sequence) {
        const prefix = sanitizeSerialCode($('brandReportPrefix')?.value || 'FMU', 4);
        return `${prefix}-${getBranchSerialCode()}-${getReportTypeCode(reportType)}-${getMonthKeyFromValue(scanDate)}-${padSerial(sequence, 4)}`;
      }
      function buildFormFPublicId(scanDate, sequence) {
        const prefix = sanitizeSerialCode($('brandReportPrefix')?.value || 'FMU', 4);
        return `${prefix}-${getBranchSerialCode()}-FF-${getMonthKeyFromValue(scanDate)}-${padSerial(sequence, 4)}`;
      }
      function getNextScopedMonthlySequence(kind, monthKey, sourceList) {
        let max = 0;
        let count = 0;
        (sourceList || []).forEach((item) => {
          const itemMonth = kind === 'report' ? getReportMonthKey(item) : getFormFMonthKey(item);
          if (itemMonth !== monthKey) return;
          count += 1;
          max = Math.max(max, Number(item?.monthlySequence) || 0);
        });
        return Math.max(max, count) + 1;
      }
      function assignReportSerialMeta(report, sourceList = getSavedReports()) {
        if (report?.reportPublicId && report?.monthlySequence) return report;
        const latest = report?.versions?.[report.versions.length - 1] || {};
        const scanDate = extractScanDateFromReportState(latest.activeTab || report?.reportType || 'nt', latest.state || {}) || report?.createdAt?.slice?.(0, 10) || getActiveScanDateForTab(report?.reportType || 'nt');
        const monthKey = getMonthKeyFromValue(scanDate);
        const seq = getNextScopedMonthlySequence('report', monthKey, (sourceList || []).filter((item) => item.id !== report.id));
        report.serialMonth = monthKey;
        report.monthlySequence = seq;
        report.reportPublicId = buildReportPublicId(report.reportType || latest.activeTab || 'nt', scanDate, seq);
        report.reportSerialNumber = `${monthKey}-${padSerial(seq, 4)}`;
        return report;
      }
      function assignFormFSerialMeta(record, sourceList = getSavedFormFs()) {
        if (record?.id && record?.monthlySequence) return record;
        const scanDate = record?.data?.formFScanDate || getActiveScanDateForTab();
        const monthKey = getMonthKeyFromValue(scanDate);
        const seq = getNextScopedMonthlySequence('formf', monthKey, (sourceList || []).filter((item) => item.id !== record.id));
        record.serialMonth = monthKey;
        record.monthlySequence = seq;
        record.id = buildFormFPublicId(scanDate, seq);
        record.formFSerialNumber = `${monthKey}-${padSerial(seq, 4)}`;
        if (record.data) record.data.formFRecordId = record.id;
        return record;
      }
      function getSavedReportPublicId(report) {
        return report?.reportPublicId || `LEGACY-${String(report?.id || 'RPT').slice(-6).toUpperCase()}`;
      }
      function getFilteredSortedReports(options) {
        options = options || {};
        var reports = Array.isArray(options.reports) ? options.reports.slice() : getSavedReports().slice();
        var searchInput = $('reportSearch');
        var statusSelect = $('reportStatusFilter');
        var sortSelect = $('reportSortOrder');
        var searchTerm = String(options.searchTerm != null ? options.searchTerm : ((searchInput && searchInput.value) || '')).trim().toLowerCase();
        var statusFilter = String(options.statusFilter != null ? options.statusFilter : ((statusSelect && statusSelect.value) || '')).trim().toLowerCase();
        var applyScopeFilter = options.applyScopeFilter !== false;

        var filtered = reports.filter(function(report) {
          if (!report) return false;
          if (applyScopeFilter) {
            var center = getCurrentCenter();
            var branch = getCurrentBranch(center);
            if (center && report.centerId && report.centerId !== center.id) return false;
            if (branch && report.branchId && report.branchId !== branch.id) return false;
          }
          if (statusFilter && String(report.status || '').toLowerCase() !== statusFilter) return false;
          if (!searchTerm) return true;
          var latest = report.versions && report.versions.length ? report.versions[report.versions.length - 1] : {};
          var meta = typeof extractVisitMetaFromVersion === 'function' ? extractVisitMetaFromVersion(report, latest) : {};
          var haystack = [
            report.title,
            report.patientName,
            report.patientId,
            report.reportType,
            report.status,
            report.reportPublicId,
            report.reportSerialNumber,
            report.centerName,
            report.branchName,
            meta.scanDate,
            meta.doctor,
            meta.indication,
            latest.note
          ].map(function(value) { return String(value || '').toLowerCase(); }).join(' ');
          return haystack.indexOf(searchTerm) !== -1;
        });

        var sortKey = String(options.sortKey != null ? options.sortKey : ((sortSelect && sortSelect.value) || 'updated_desc')).toLowerCase();
        filtered.sort(function(a, b) {
          var aUpdated = new Date(a.updatedAt || a.createdAt || 0).getTime();
          var bUpdated = new Date(b.updatedAt || b.createdAt || 0).getTime();
          if (sortKey === 'updated_asc') return aUpdated - bUpdated;
          if (sortKey === 'patient_az') return String(a.patientName || '').localeCompare(String(b.patientName || ''));
          if (sortKey === 'patient_za') return String(b.patientName || '').localeCompare(String(a.patientName || ''));
          if (sortKey === 'status_az') return String(a.status || '').localeCompare(String(b.status || ''));
          if (sortKey === 'title_az') return String(a.title || '').localeCompare(String(b.title || ''));
          return bUpdated - aUpdated;
        });
        return filtered;
      }
      function getReportDisplayId(reportType = getActiveTabName(), report = getCurrentLoadedReport()) {
        if (report && report.reportPublicId) return report.reportPublicId;
        const scanDate = getActiveScanDateForTab(reportType);
        const monthKey = getMonthKeyFromValue(scanDate);
        const seq = getNextScopedMonthlySequence('report', monthKey, getSavedReports());
        return buildReportPublicId(reportType, scanDate, seq);
      }
      function interpolate(x, xs, ys) {
        if (x <= xs[0]) return ys[0];
        if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
        for (let i = 0; i < xs.length - 1; i += 1) {
          if (x >= xs[i] && x <= xs[i + 1]) {
            const ratio = (x - xs[i]) / (xs[i + 1] - xs[i]);
            return ys[i] + ratio * (ys[i + 1] - ys[i]);
          }
        }
        return ys[0];
      }
      function gaByCrl(crl) { if (!crl || crl <= 0) return { text: '-', days: null }; const days = Math.round(42 + (crl * 0.8)); const weeks = Math.floor(days / 7); const remDays = days % 7; return { text: `${weeks}w ${remDays}d`, days }; }
      function gaFromMm(value, factor, base) { if (!value || value <= 0) return null; return base + factor * value; }
      function gaWeekDecimal(weeks, days) { return Number(weeks || 0) + (Number(days || 0) / 7); }
      function interpolateWeeklyMedian(gaWeek, key) {
        const weeks = Object.keys(WEEKLY_REFERENCE).map(Number).sort((a, b) => a - b);
        if (gaWeek <= weeks[0]) return WEEKLY_REFERENCE[weeks[0]][key];
        if (gaWeek >= weeks[weeks.length - 1]) return WEEKLY_REFERENCE[weeks[weeks.length - 1]][key];
        for (let i = 0; i < weeks.length - 1; i += 1) {
          const w1 = weeks[i], w2 = weeks[i + 1];
          if (gaWeek >= w1 && gaWeek <= w2) {
            const ratio = (gaWeek - w1) / (w2 - w1);
            return WEEKLY_REFERENCE[w1][key] + (WEEKLY_REFERENCE[w2][key] - WEEKLY_REFERENCE[w1][key]) * ratio;
          }
        }
        return WEEKLY_REFERENCE[20][key];
      }
      function percentileFromZ(z) {
        if (z <= -2.33) return '<1st'; if (z <= -1.88) return '3rd'; if (z <= -1.28) return '10th'; if (z <= -0.67) return '25th';
        if (z <= 0.67) return '50th'; if (z <= 1.28) return '75th'; if (z <= 1.88) return '90th'; if (z <= 2.33) return '97th'; return '>99th';
      }
      function tablePercentile(value, gaWeek, key) {
        const median = interpolateWeeklyMedian(gaWeek, key);
        if (!value || !median) return '-';
        const tolerance = Math.max(1, median * (PERCENTILE_TOLERANCE[key] || 0.1));
        return percentileFromZ((value - median) / tolerance);
      }
      function percentileTextToNumeric(text) {
        const map = { '<1st': 1, '3rd': 3, '10th': 10, '25th': 25, '50th': 50, '75th': 75, '90th': 90, '97th': 97, '>99th': 99, '≤50th': 50, '50th-95th': 75, '95th-99th': 97 };
        return map[text] ?? 50;
      }
      function daysToText(days) { if (days == null || Number.isNaN(days)) return '-'; const rounded = Math.round(days); return `${Math.floor(rounded / 7)}w ${rounded % 7}d`; }
      function dopplerBand(value, low, high) { if (!value) return '-'; if (value < low) return 'Low'; if (value > high) return 'High'; return 'Normal'; }
      function maternalAgeBaseRisk(age) { if (age < 25) return 1500; if (age < 30) return 1000; if (age < 35) return 650; if (age < 37) return 350; if (age < 40) return 180; return 100; }
      function getPercentile(nt, expected, p95, p99) { if (nt <= expected) return '≤50th'; if (nt <= p95) return '50th-95th'; if (nt <= p99) return '95th-99th'; return '>99th'; }
      function computeRisk(age, nt, expected, p95, p99, nasalBone, dvFlow, tricuspid) {
        let denominator = maternalAgeBaseRisk(age);
        let multiplier = 1;
        if (nt > expected + 0.5) multiplier *= 1.8;
        if (nt > p95) multiplier *= 2.5;
        if (nt > 3.5) multiplier *= 3.5;
        if (nt > p99) multiplier *= 2.0;
        if (nasalBone === 'absent') multiplier *= 2.5;
        if (nasalBone === 'uncertain') multiplier *= 1.2;
        if (dvFlow === 'abnormal') multiplier *= 1.8;
        if (tricuspid === 'present') multiplier *= 1.6;
        const adjustedDenominator = Math.max(2, Math.round(denominator / multiplier));
        let category = 'Low Risk', badgeClass = 'badge-green', recommendation = 'Routine follow-up and correlation with standard first trimester screening protocol.';
        if (adjustedDenominator <= 250) { category = 'High Risk'; badgeClass = 'badge-red'; recommendation = 'High-risk pattern. Advise further evaluation / genetic counselling / validated combined screening as clinically appropriate.'; }
        else if (adjustedDenominator <= 1000) { category = 'Intermediate Risk'; badgeClass = 'badge-amber'; recommendation = 'Intermediate-risk pattern. Consider additional screening correlation and closer follow-up.'; }
        return { ratio: `1:${adjustedDenominator}`, category, badgeClass, recommendation };
      }
      function patientPointSeries(selectedCrl, selectedNt) { return crlPoints.map(v => (Math.round(v * 10) === Math.round(selectedCrl * 10) ? selectedNt : null)); }
      function describeSystem(label, status, detail, normalText, abnormalText, suboptimalText) {
        if (status === 'Normal') return `${label}: ${normalText}`;
        if (status === 'Abnormal') return `${label}: ${abnormalText}${detail ? ` Specific concern: ${detail}.` : ''}`;
        return `${label}: ${suboptimalText}`;
      }
      function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
      function makeFormattedSection(title, bodyHtml) { return `<div class="fr-section"><div class="fr-section-title">${escapeHtml(title)}</div>${bodyHtml}</div>`; }
      function makeFormattedLinesSection(title, lines) { const valid = lines.filter(Boolean); return makeFormattedSection(title, valid.map(line => `<div class="fr-line">${escapeHtml(line)}</div>`).join('')); }
      function makeFormattedParagraphSection(title, paragraphs) { const valid = paragraphs.filter(Boolean); return makeFormattedSection(title, valid.map(p => `<p class="fr-para">${escapeHtml(p)}</p>`).join('')); }
      function makeFormattedListSection(title, items, emptyText = 'Nil.') { const valid = items.filter(Boolean); return valid.length ? makeFormattedSection(title, `<ul class="fr-list">${valid.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`) : makeFormattedSection(title, `<div class="fr-line">${escapeHtml(emptyText)}</div>`); }
      function buildLevel2OrganSystemHtml(systemEntries) {
        return `<div class="formatted-report-block">${systemEntries.map(entry => makeFormattedLinesSection(entry.title, [entry.summary, entry.status === 'Abnormal' && entry.detail ? `Detail: ${entry.detail}` : ''].filter(Boolean))).join('')}</div>`;
      }
      function buildLevel2StructuralSummaryHtml(systemEntries) {
        const abnormalEntries = systemEntries.filter(entry => entry.status === 'Abnormal');
        const suboptimalEntries = systemEntries.filter(entry => entry.status === 'Suboptimal');
        const normalEntries = systemEntries.filter(entry => entry.status === 'Normal');
        return `<div class="formatted-report-block">${[
          makeFormattedListSection('Abnormal Findings', abnormalEntries.map(entry => entry.detail ? `${entry.title}: ${entry.detail}` : `${entry.title}: Abnormality flagged.`), 'No structural abnormality entered.'),
          makeFormattedListSection('Suboptimal Views', suboptimalEntries.map(entry => `${entry.title}: Visualization suboptimal on the current examination.`), 'No suboptimal view entered.'),
          makeFormattedListSection('Systems Reported Unremarkable', normalEntries.map(entry => entry.title), 'No system marked unremarkable.')
        ].join('')}</div>`;
      }
      function buildSoftMarkerDetailedHtml(registry, note, interpretation) {
        const presentMarkers = registry.filter(marker => marker.present).map(marker => marker.name);
        const absentMarkers = registry.filter(marker => !marker.present).map(marker => marker.name);
        return `<div class="formatted-report-block">${[
          makeFormattedListSection('Present Markers', presentMarkers, 'No soft marker reported as present.'),
          makeFormattedListSection('Absent / Not Identified', absentMarkers, 'Nil.'),
          makeFormattedParagraphSection('Interpretation', [interpretation, note ? `Additional note: ${note}` : ''])
        ].join('')}</div>`;
      }
      function getSoftMarkerRiskBand(score, presentCount) {
        if (!presentCount) return { label: 'None', tone: 'badge-green', note: 'No soft marker is present; dedicated graphical soft-marker risk assessment is not required.' };
        if (score <= 1.5) return { label: 'Low', tone: 'badge-green', note: 'Present soft-marker burden is low in this structured prototype.' };
        if (score <= 3.5) return { label: 'Moderate', tone: 'badge-amber', note: 'Present soft-marker burden is moderate and warrants clinical / risk correlation.' };
        return { label: 'High', tone: 'badge-red', note: 'Present soft-marker burden is high in this structured prototype and warrants detailed review.' };
      }
      function buildLevel2ConsultantHtml(data) {
        const growthLines = [`Average fetal biometry corresponds to approximately ${data.gaBioText}.`, `Percentile profile: BPD ${data.bpdPct}, HC ${data.hcPct}, AC ${data.acPct}, FL ${data.flPct}, EFW ${data.efwPct}.`, `Growth interpretation: ${data.growthText}.`];
        const dopplerLines = [`MCA PI ${data.mcaPi.toFixed(2)} (${data.mcaBand}).`, `Umbilical artery PI ${data.uaPi.toFixed(2)} (${data.uaBand}).`, `Mean uterine artery PI ${data.utPi.toFixed(2)} (${data.utBand}).`, `Overall Doppler impression: ${data.dopplerText}.`];
        const conclusionLines = [`Final category: ${data.conclusionCategory}.`, `Recommendation: ${data.standardRecommendation}`];
        return `<div class="formatted-report-block">${[
          makeFormattedLinesSection('Growth Summary', growthLines),
          makeFormattedSection('Structural Survey Summary', data.structuralSummaryHtml),
          makeFormattedSection('Soft Marker Review', data.softMarkerDetailedHtml),
          makeFormattedLinesSection('Doppler Summary', dopplerLines),
          makeFormattedLinesSection('Conclusion & Recommendation', conclusionLines)
        ].join('')}</div>`;
      }
      function renderStatusWithDetail(status, detail) { return status === 'Abnormal' && detail ? `${status} (${detail})` : status; }
      function getConclusionTone(category) { if (category === 'Structural anomaly' || category === 'Multiple / significant soft markers') return 'badge-red'; if (category === 'Isolated soft marker' || category === 'Suboptimal study') return 'badge-amber'; return 'badge-green'; }
      function getStructureTone(text) { if (text === 'Structural abnormality flagged') return 'badge-red'; if (text === 'Some views suboptimal') return 'badge-amber'; return 'badge-green'; }
      function getRiskLevelFromConclusion(category) { if (category === 'Structural anomaly' || category === 'Multiple / significant soft markers') return { label: 'High', tone: 'badge-red' }; if (category === 'Isolated soft marker' || category === 'Suboptimal study') return { label: 'Moderate', tone: 'badge-amber' }; return { label: 'Low', tone: 'badge-green' }; }
      function getUrgencyFromConclusion(category, dopplerFlags, gaDiff) { if (category === 'Structural anomaly') return { label: 'Urgent referral', tone: 'badge-red' }; if (dopplerFlags.length || gaDiff > 10 || category === 'Multiple / significant soft markers') return { label: 'Early follow-up', tone: 'badge-red' }; if (category === 'Isolated soft marker' || category === 'Suboptimal study') return { label: 'Short interval', tone: 'badge-amber' }; return { label: 'Routine', tone: 'badge-green' }; }
      function getIugrAssessment(acPct, efwPct, liquor, mcaPi = null, uaPi = null, cpr = null) {
        const lowGrowth = ['10th','3rd','<1st'];
        let category = 'Low', tone = 'badge-green', reason = 'No current strong evidence of growth restriction in the entered parameters.';
        if (lowGrowth.includes(acPct) || lowGrowth.includes(efwPct) || liquor === 'Reduced') { category = 'Moderate'; tone = 'badge-amber'; reason = 'Borderline growth parameter and/or reduced liquor requires interval surveillance.'; }
        if (['3rd','<1st'].includes(acPct) || ['3rd','<1st'].includes(efwPct) || (uaPi !== null && uaPi > 1.3) || (cpr !== null && cpr < 1.08)) { category = 'High'; tone = 'badge-red'; reason = 'Abnormal growth parameter and/or Doppler pattern raises concern for placental insufficiency / IUGR.'; }
        if (mcaPi !== null && mcaPi < 1.2 && uaPi !== null && uaPi > 1.3) { category = 'High'; tone = 'badge-red'; reason = 'Combined cerebral redistribution and raised umbilical artery impedance pattern suggests significant IUGR risk.'; }
        return { category, tone, reason };
      }

      function getDefaultCenterPlatform() {
        return {
          state: 'Active',
          autoLockOnOverdue: true,
          ownerNote: '',
          lastOwnerReviewAt: ''
        };
      }
      function getDefaultCenterUsers(center = null) {
        const seed = [
          { name: 'Local Admin', role: 'admin' },
          { name: (center?.profile?.consultant || 'Consultant').split(',')[0].trim() || 'Consultant', role: 'consultant' }
        ];
        const seen = new Set();
        return seed.filter((user) => {
          const key = `${user.name.toLowerCase()}__${user.role}`;
          if (!user.name || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }
      function getDefaultCenterSettings(center = null) {
        return {
          features: {
            doctorSignature: true,
            centerLabels: true,
            monthlyReports: true,
            kyc: false,
            payments: false,
            whatsappShare: true,
            patientMaster: true
          },
          kyc: {
            ownerName: '',
            businessName: center?.profile?.clinic || '',
            registrationId: center?.profile?.registration || '',
            taxId: '',
            billingEmail: '',
            billingPhone: '',
            status: 'Pending'
          },
          payments: {
            plan: 'Starter',
            monthlyFee: '0',
            status: 'Inactive',
            billingDay: '5',
            lastPaidOn: '',
            nextDueOn: '',
            paymentReference: ''
          },
          platform: getDefaultCenterPlatform()
        };
      }
      function ensureCenterSettings(center) {
        if (!center) return getDefaultCenterSettings();
        const defaults = getDefaultCenterSettings(center);
        center.settings = center.settings || {};
        center.settings.features = { ...defaults.features, ...(center.settings.features || {}) };
        center.settings.kyc = { ...defaults.kyc, ...(center.settings.kyc || {}) };
        center.settings.payments = { ...defaults.payments, ...(center.settings.payments || {}) };
        center.settings.platform = { ...defaults.platform, ...(center.settings.platform || {}) };
        center.users = Array.isArray(center.users) && center.users.length ? center.users : getDefaultCenterUsers(center);
        return center.settings;
      }
      function buildDefaultCenters() {
        const microlab = BRAND_TEMPLATES.microlab, aditya = BRAND_TEMPLATES.aditya, other = BRAND_TEMPLATES.other;
        return [
          { id: 'microlab-demo', displayName: 'Microlab Demo', password: 'demo123', profile: { clinic: microlab.clinic, tagline: microlab.tagline, prefix: microlab.prefix, consultant: microlab.consultant, registration: microlab.registration, logo: microlab.logo }, branches: [{ id: 'main', name: 'Main City Branch', address: microlab.address, contact: microlab.contact, website: microlab.website }, { id: 'north', name: 'North Branch', address: 'Microlab North Branch, Women Imaging Annex', contact: '+91 11111 11112 | north@microlab-example.com', website: microlab.website }] },
          { id: 'aditya-demo', displayName: 'Aditya Demo', password: 'demo123', profile: { clinic: aditya.clinic, tagline: aditya.tagline, prefix: aditya.prefix, consultant: aditya.consultant, registration: aditya.registration, logo: aditya.logo }, branches: [{ id: 'main', name: 'Main Diagnostics Branch', address: aditya.address, contact: aditya.contact, website: aditya.website }, { id: 'satellite', name: 'Satellite Branch', address: 'Aditya Diagnostics, Satellite Women Imaging Division', contact: '+91 22222 22223 | satellite@aditya-example.com', website: aditya.website }] },
          { id: 'other-demo', displayName: 'Other Demo', password: 'demo123', profile: { clinic: other.clinic, tagline: other.tagline, prefix: other.prefix, consultant: other.consultant, registration: other.registration, logo: other.logo }, branches: [{ id: 'main', name: 'Main Specialty Branch', address: other.address, contact: other.contact, website: other.website }] }
        ];
      }
      function getCenters() {
        try {
          const raw = localStorage.getItem(CENTER_STORAGE_KEY);
          const parsed = raw ? JSON.parse(raw) : [];
          if (Array.isArray(parsed) && parsed.length) {
            const normalized = parsed.map((center) => {
              ensureCenterSettings(center);
              return center;
            });
            localStorage.setItem(CENTER_STORAGE_KEY, JSON.stringify(normalized));
            return normalized;
          }
        } catch (_) {}
        const defaults = buildDefaultCenters().map((center) => { ensureCenterSettings(center); return center; });
        localStorage.setItem(CENTER_STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }
      function persistCenters(centers) { localStorage.setItem(CENTER_STORAGE_KEY, JSON.stringify(centers)); if ($('superAdminConsoleCard')) renderSuperAdminConsole(); queueAutoSyncScope('center-registry-update'); }
      function getActiveCenterSession() { try { const raw = localStorage.getItem(ACTIVE_CENTER_SESSION_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; } }
      function persistActiveCenterSession(session) { if (!session) { localStorage.removeItem(ACTIVE_CENTER_SESSION_KEY); return; } localStorage.setItem(ACTIVE_CENTER_SESSION_KEY, JSON.stringify(session)); }
      function getCurrentCenter() { const session = getActiveCenterSession(); return getCenters().find(center => center.id === session?.centerId) || null; }
      function getCurrentUserContext() { const session = getActiveCenterSession(); const roleKey = session?.role || 'admin'; const roleDefinition = ROLE_DEFINITIONS[roleKey] || ROLE_DEFINITIONS.admin; return { userName: session?.userName || 'Local Admin', role: roleKey, roleLabel: roleDefinition.label, permissions: roleDefinition.permissions }; }
      function hasPermission(permission) { return getCurrentUserContext().permissions.includes(permission); }
      function getCurrentBranch(center = getCurrentCenter(), branchId = getActiveCenterSession()?.branchId) { if (!center) return null; return center.branches.find(branch => branch.id === branchId) || center.branches[0] || null; }
      function buildAuditEntry(action, details = '') { const user = getCurrentUserContext(); const center = getCurrentCenter(); const branch = getCurrentBranch(center); return { timestamp: new Date().toISOString(), action, details, actorName: user.userName, actorRole: user.roleLabel, centerName: center?.displayName || 'Guest / local scope', branchName: branch?.name || 'Default' }; }
      function getCurrentLoadedReport() { return currentLoadedReportId ? getSavedReports().find(item => item.id === currentLoadedReportId) || null : null; }
      function slugifyKey(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^\-+|\-+$/g, '') || `branch-${Date.now()}`; }
      function getCurrentScopeLabel() { const center = getCurrentCenter(); const branch = getCurrentBranch(center); return (!center || !branch) ? 'Guest / local scope' : `${center.displayName} • ${branch.name}`; }
      function getScopedReportStorageKey() { const session = getActiveCenterSession(); return `${REPORT_STORAGE_KEY_PREFIX}__${session?.centerId || 'guest'}__${session?.branchId || 'default'}`; }
      function populateCenterOptions() { const session = getActiveCenterSession(); setHtml('centerLoginSelect', '<option value="">Guest / local scope</option>' + getCenters().map(center => `<option value="${center.id}">${escapeHtml(center.displayName)}</option>`).join('')); if ($('centerLoginSelect')) $('centerLoginSelect').value = session?.centerId || ''; }
      function populateBranchOptions(center = getCurrentCenter(), selectedBranchId = null) { if (!center) { setHtml('centerBranchSelector', '<option value="">Guest / local scope</option>'); if ($('centerBranchSelector')) $('centerBranchSelector').disabled = true; return; } if ($('centerBranchSelector')) $('centerBranchSelector').disabled = false; setHtml('centerBranchSelector', center.branches.map(branch => `<option value="${branch.id}">${escapeHtml(branch.name)}</option>`).join('')); if ($('centerBranchSelector')) $('centerBranchSelector').value = selectedBranchId || getCurrentBranch(center)?.id || center.branches[0]?.id || ''; }
      function setBrandInputsFromCenter(center, branch) {
        if (!center || !branch) return;
        if ($('brandTemplate')) $('brandTemplate').value = 'custom';
        $('brandClinicName').value = center.profile.clinic || 'Fetal Medicine & Ultrasound Centre';
        $('brandTagline').value = center.profile.tagline || 'Advanced Obstetric Imaging • Fetal Screening • Doppler';
        $('brandReportPrefix').value = center.profile.prefix || 'FMU';
        $('brandConsultant').value = center.profile.consultant || 'Dr Consultant Name, MD Radiodiagnosis';
        $('brandRegistration').value = center.profile.registration || 'Reg. No: XXXXX';
        $('brandLogoText').value = center.profile.logo || 'FM';
        $('brandBranchName').value = branch.name || 'Main Branch';
        $('brandAddress').value = branch.address || 'Main Branch, Premium Women Imaging Unit';
        $('brandContact').value = branch.contact || '+91 00000 00000 | reception@clinic.com';
        $('brandWebsite').value = branch.website || 'www.clinic-example.com';
      }
      function renderCenterSessionInfo() {
        populateCenterOptions();
        const session = getActiveCenterSession();
        const center = getCurrentCenter();
        const branch = getCurrentBranch(center);
        if ($('centerUserName')) $('centerUserName').value = session?.userName || 'Local Admin';
        if ($('centerRoleSelect')) $('centerRoleSelect').value = session?.role || 'admin';
        populateBranchOptions(center, branch?.id || null);
        if (!center || !branch) {
          const guestUser = getCurrentUserContext();
          setHtml('centerSessionInfo', `Guest mode active for <strong>${escapeHtml(guestUser.userName)}</strong> as <span class="role-badge-inline">${escapeHtml(guestUser.roleLabel)}</span>. Existing workflow remains usable, but saved reports stay in a local guest scope. Sign in to isolate reports and branding by center and branch. Demo password: <strong>demo123</strong>.`);
          if ($('saveCenterProfileBtn')) $('saveCenterProfileBtn').disabled = true;
          if ($('saveBranchProfileBtn')) $('saveBranchProfileBtn').disabled = true;
          applyRoleAndLockState();
          return;
        }
        const user = getCurrentUserContext();
        const settings = ensureCenterSettings(center);
        const effective = getEffectiveCenterFeatureState(center);
        const premiumNote = effective.disabled ? 'Center access is disabled by the owner console.' : (effective.premiumLocked ? `Premium features are locked because billing status is ${escapeHtml(settings.payments.status)}.` : 'Premium features are active according to current billing state.');
        setHtml('centerSessionInfo', `<div><strong>Signed in:</strong> ${escapeHtml(center.displayName)}</div><div><strong>User:</strong> ${escapeHtml(user.userName)} <span class="role-badge-inline">${escapeHtml(user.roleLabel)}</span></div><div><strong>Branch scope:</strong> ${escapeHtml(branch.name)}</div><div><strong>Platform state:</strong> ${escapeHtml(settings.platform.state)} • <strong>Plan:</strong> ${escapeHtml(settings.payments.plan || 'Starter')} • <strong>Billing:</strong> ${escapeHtml(settings.payments.status || 'Inactive')}</div><div><strong>Owner note:</strong> ${escapeHtml(settings.platform.ownerNote || 'No owner note')}</div><div><strong>Feature state:</strong> ${premiumNote}</div>`);
        if ($('saveCenterProfileBtn')) $('saveCenterProfileBtn').disabled = false;
        if ($('saveBranchProfileBtn')) $('saveBranchProfileBtn').disabled = false;
        applyRoleAndLockState();
      }
      function getCurrentCenterSettings() {
        const center = getCurrentCenter();
        return center ? ensureCenterSettings(center) : getDefaultCenterSettings();
      }
      function getDefaultBackendConfig() {
        return {
          mode: 'local',
          apiBaseUrl: '',
          apiKey: '',
          authToken: '',
          autoSync: false,
          lastHealth: '',
          lastSyncAt: '',
          lastSyncError: '',
          lastLoginAt: '',
          lastBackendUser: ''
        };
      }
      function normalizeApiBaseUrl(value) {
        return String(value || '').trim().replace(/\/+$/, '');
      }
      function getBackendConfig() {
        try {
          const parsed = JSON.parse(localStorage.getItem(BACKEND_CONFIG_STORAGE_KEY) || '{}');
          return { ...getDefaultBackendConfig(), ...(parsed || {}), apiBaseUrl: normalizeApiBaseUrl(parsed?.apiBaseUrl || '') };
        } catch (_) {
          return getDefaultBackendConfig();
        }
      }
      function persistBackendConfig(config) {
        const next = { ...getDefaultBackendConfig(), ...(config || {}), apiBaseUrl: normalizeApiBaseUrl(config?.apiBaseUrl || '') };
        localStorage.setItem(BACKEND_CONFIG_STORAGE_KEY, JSON.stringify(next));
        applyBackendConfigToPanel();
        return next;
      }
      function readBackendConfigFromPanel() {
        return {
          mode: $('backendMode')?.value || 'local',
          apiBaseUrl: $('backendApiBaseUrl')?.value || '',
          apiKey: $('backendApiKey')?.value || '',
          authToken: $('backendAuthToken')?.value || '',
          autoSync: !!$('backendAutoSync')?.checked,
          lastHealth: getBackendConfig().lastHealth || '',
          lastSyncAt: getBackendConfig().lastSyncAt || '',
          lastSyncError: getBackendConfig().lastSyncError || '',
          lastLoginAt: getBackendConfig().lastLoginAt || '',
          lastBackendUser: getBackendConfig().lastBackendUser || ''
        };
      }
      function getBackendHeaders(tokenOverride = '') {
        const cfg = getBackendConfig();
        const headers = { 'Content-Type': 'application/json' };
        if (cfg.apiKey) headers['x-api-key'] = cfg.apiKey;
        const rawToken = tokenOverride || cfg.authToken || '';
        if (rawToken) headers.Authorization = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`;
        return headers;
      }
      function isBackendEnabled() {
        const cfg = getBackendConfig();
        return cfg.mode !== 'local' && !!normalizeApiBaseUrl(cfg.apiBaseUrl);
      }
      function renderBackendStatus(message = '') {
        const cfg = getBackendConfig();
        const modeLabel = cfg.mode === 'local' ? 'Local only' : (cfg.mode === 'hybrid' ? 'Hybrid local + sync' : 'Remote-first API');
        const endpointText = cfg.apiBaseUrl || 'Not configured';
        const syncText = cfg.lastSyncAt ? formatDate(cfg.lastSyncAt) : 'No sync yet';
        const healthText = cfg.lastHealth || 'No health check yet';
        const authText = cfg.authToken ? 'Token present' : 'No token';
        const body = message || `Mode: ${modeLabel}. API base: ${endpointText}. Auth: ${authText}. Last health: ${healthText}. Last sync: ${syncText}.${cfg.lastSyncError ? ` Last error: ${cfg.lastSyncError}` : ''}`;
        setHtml('backendStatusInfo', body);
      }
      function applyBackendConfigToPanel() {
        const cfg = getBackendConfig();
        if ($('backendMode')) $('backendMode').value = cfg.mode || 'local';
        if ($('backendApiBaseUrl')) $('backendApiBaseUrl').value = cfg.apiBaseUrl || '';
        if ($('backendApiKey')) $('backendApiKey').value = cfg.apiKey || '';
        if ($('backendAuthToken')) $('backendAuthToken').value = cfg.authToken || '';
        if ($('backendAutoSync')) $('backendAutoSync').checked = !!cfg.autoSync;
        renderBackendStatus();
      }
      async function callBackendApi(path, options = {}) {
        const cfg = getBackendConfig();
        const base = normalizeApiBaseUrl(cfg.apiBaseUrl);
        if (!base) throw new Error('Backend API base URL is not configured.');
        const requestInit = {
          method: options.method || 'GET',
          headers: getBackendHeaders(options.authToken || ''),
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined
        };
        const response = await fetch(base + path, requestInit);
        const rawText = await response.text();
        let payload = null;
        try {
          payload = rawText ? JSON.parse(rawText) : null;
        } catch (_) {
          payload = { raw: rawText };
        }
        if (!response.ok) {
          throw new Error((payload && (payload.message || payload.error)) || `HTTP ${response.status}`);
        }
        return payload;
      }
      function buildBackendScopePayload(reason = 'manual-sync') {
        const center = getCurrentCenter();
        const branch = getCurrentBranch(center);
        const cfg = getBackendConfig();
        return {
          appVersion: 'Astraia-like Obstetric MVP v6.2',
          exportedAt: new Date().toISOString(),
          reason,
          mode: cfg.mode,
          scope: {
            centerId: center?.id || 'guest',
            centerName: center?.displayName || 'Guest / local scope',
            branchId: branch?.id || 'default',
            branchName: branch?.name || 'Default',
            user: getCurrentUserContext()
          },
          center: center ? JSON.parse(JSON.stringify(center)) : null,
          branch: branch ? JSON.parse(JSON.stringify(branch)) : null,
          reports: getSavedReports(),
          formFs: getSavedFormFs(),
          receptionEntries: getSavedReceptionEntries(),
          printAssets: getStoredPrintAssets()
        };
      }
      function hydrateCenterSnapshot(snapshot) {
        if (!snapshot) return;
        if (Array.isArray(snapshot.centers) && snapshot.centers.length) {
          const normalized = snapshot.centers.map((center) => { ensureCenterSettings(center); return center; });
          localStorage.setItem(CENTER_STORAGE_KEY, JSON.stringify(normalized));
          return;
        }
        if (!snapshot.center) return;
        const centers = getCenters();
        const incoming = snapshot.center;
        ensureCenterSettings(incoming);
        const index = centers.findIndex((item) => item.id === incoming.id);
        if (index >= 0) centers[index] = incoming;
        else centers.push(incoming);
        localStorage.setItem(CENTER_STORAGE_KEY, JSON.stringify(centers));
      }
      function hydrateScopeSnapshot(snapshot) {
        if (!snapshot) return;
        hydrateCenterSnapshot(snapshot);
        if (Array.isArray(snapshot.reports)) localStorage.setItem(getScopedReportStorageKey(), JSON.stringify(snapshot.reports));
        if (Array.isArray(snapshot.formFs)) localStorage.setItem(getScopedFormFStorageKey(), JSON.stringify(snapshot.formFs));
        if (Array.isArray(snapshot.receptionEntries)) localStorage.setItem(getScopedReceptionStorageKey(), JSON.stringify(snapshot.receptionEntries));
        if (snapshot.printAssets) persistPrintAssets(snapshot.printAssets);
      }
      async function attemptBackendCenterLogin(center, password, userName, role) {
        const payload = await callBackendApi('/api/v1/auth/center-login', {
          method: 'POST',
          body: {
            centerId: center.id,
            password,
            userName,
            role,
            branchId: getCurrentBranch(center)?.id || center.branches?.[0]?.id || 'main'
          }
        });
        const token = payload?.token || payload?.authToken || payload?.accessToken || '';
        const cfg = getBackendConfig();
        persistBackendConfig({
          ...cfg,
          authToken: token || cfg.authToken,
          lastLoginAt: new Date().toISOString(),
          lastBackendUser: userName,
          lastSyncError: ''
        });
        return payload;
      }
      async function testBackendConnection() {
        const cfg = getBackendConfig();
        const payload = await callBackendApi('/health');
        const next = persistBackendConfig({ ...cfg, lastHealth: `OK • ${new Date().toLocaleString('en-GB')}`, lastSyncError: '' });
        renderBackendStatus(`Backend health check succeeded for <strong>${escapeHtml(next.apiBaseUrl || '')}</strong>. Response: <strong>${escapeHtml(payload?.status || payload?.message || 'OK')}</strong>.`);
        return payload;
      }
      async function syncScopeToBackend(reason = 'manual-sync', silent = false) {
        const cfg = getBackendConfig();
        if (!isBackendEnabled()) throw new Error('Backend mode is not enabled or API base URL is missing.');
        const payload = await callBackendApi('/api/v1/sync/export', { method: 'POST', body: buildBackendScopePayload(reason) });
        persistBackendConfig({ ...cfg, lastSyncAt: new Date().toISOString(), lastSyncError: '' });
        if (!silent) renderBackendStatus(`Current scope was pushed to the backend successfully. Scope: <strong>${escapeHtml(getCurrentScopeLabel())}</strong>.`);
        return payload;
      }
      async function pullScopeFromBackend(silent = false) {
        const cfg = getBackendConfig();
        if (!isBackendEnabled()) throw new Error('Backend mode is not enabled or API base URL is missing.');
        const center = getCurrentCenter();
        const branch = getCurrentBranch(center);
        const payload = await callBackendApi('/api/v1/sync/import', {
          method: 'POST',
          body: {
            centerId: center?.id || 'guest',
            branchId: branch?.id || 'default'
          }
        });
        const snapshot = payload?.snapshot || payload;
        hydrateScopeSnapshot(snapshot);
        persistBackendConfig({ ...cfg, lastSyncAt: new Date().toISOString(), lastSyncError: '' });
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
        refreshBranding();
        applyPrintAssets();
        renderSavedReports();
        renderSavedFormFs();
        renderReceptionDesk();
        if (!silent) renderBackendStatus(`Current scope was pulled from the backend successfully. Scope: <strong>${escapeHtml(getCurrentScopeLabel())}</strong>.`);
        return snapshot;
      }
      function queueAutoSyncScope(reason = 'autosync') {
        const cfg = getBackendConfig();
        if (!cfg.autoSync || !isBackendEnabled() || !getCurrentCenter()) return;
        if (backendAutoSyncTimer) window.clearTimeout(backendAutoSyncTimer);
        backendAutoSyncTimer = window.setTimeout(async () => {
          try {
            await syncScopeToBackend(reason, true);
            renderBackendStatus(`Auto-sync completed for <strong>${escapeHtml(getCurrentScopeLabel())}</strong>.`);
          } catch (error) {
            const next = persistBackendConfig({ ...getBackendConfig(), lastSyncError: error.message || 'Auto-sync failed' });
            renderBackendStatus(`Auto-sync failed for <strong>${escapeHtml(getCurrentScopeLabel())}</strong>: ${escapeHtml(next.lastSyncError || 'Unknown error')}`);
          }
        }, 1200);
      }
      function saveBackendConfigFromPanel() {
        const cfg = persistBackendConfig(readBackendConfigFromPanel());
        renderBackendStatus(`Backend configuration saved. Mode: <strong>${escapeHtml(cfg.mode)}</strong>. API base: <strong>${escapeHtml(cfg.apiBaseUrl || 'not configured')}</strong>.`);
      }
      function clearBackendToken() {
        const cfg = getBackendConfig();
        persistBackendConfig({ ...cfg, authToken: '' });
        renderBackendStatus('Stored backend bearer token cleared.');
      }
      function loadCenterSettingsIntoPanel() {
        const center = getCurrentCenter();
        const settings = getCurrentCenterSettings();
        if ($('settingEnableDoctorSignature')) $('settingEnableDoctorSignature').checked = !!settings.features.doctorSignature;
        if ($('settingEnableCenterLabels')) $('settingEnableCenterLabels').checked = !!settings.features.centerLabels;
        if ($('settingEnableMonthlyReports')) $('settingEnableMonthlyReports').checked = !!settings.features.monthlyReports;
        if ($('settingEnableKyc')) $('settingEnableKyc').checked = !!settings.features.kyc;
        if ($('settingEnablePayments')) $('settingEnablePayments').checked = !!settings.features.payments;
        if ($('settingEnableWhatsappShare')) $('settingEnableWhatsappShare').checked = !!settings.features.whatsappShare;
        if ($('settingEnablePatientMaster')) $('settingEnablePatientMaster').checked = !!settings.features.patientMaster;
        if ($('settingKycOwnerName')) $('settingKycOwnerName').value = settings.kyc.ownerName || '';
        if ($('settingKycBusinessName')) $('settingKycBusinessName').value = settings.kyc.businessName || center?.profile?.clinic || '';
        if ($('settingKycRegistrationId')) $('settingKycRegistrationId').value = settings.kyc.registrationId || center?.profile?.registration || '';
        if ($('settingKycTaxId')) $('settingKycTaxId').value = settings.kyc.taxId || '';
        if ($('settingKycBillingEmail')) $('settingKycBillingEmail').value = settings.kyc.billingEmail || '';
        if ($('settingKycBillingPhone')) $('settingKycBillingPhone').value = settings.kyc.billingPhone || '';
        if ($('settingKycStatus')) $('settingKycStatus').value = settings.kyc.status || 'Pending';
        if ($('settingPaymentPlan')) $('settingPaymentPlan').value = settings.payments.plan || 'Starter';
        if ($('settingMonthlyFee')) $('settingMonthlyFee').value = settings.payments.monthlyFee || '0';
        if ($('settingPaymentStatus')) $('settingPaymentStatus').value = settings.payments.status || 'Inactive';
        if ($('settingBillingDay')) $('settingBillingDay').value = settings.payments.billingDay || '5';
        if ($('settingLastPaidOn')) $('settingLastPaidOn').value = settings.payments.lastPaidOn || '';
        if ($('settingNextDueOn')) $('settingNextDueOn').value = settings.payments.nextDueOn || '';
        if ($('settingPaymentReference')) $('settingPaymentReference').value = settings.payments.paymentReference || '';
        setHtml('centerSettingsInfo', center ? `Center settings loaded for <strong>${escapeHtml(center.displayName)}</strong>. These controls are persisted per center and reapplied on sign-in.` : 'Guest mode uses temporary defaults. Sign in to a center to persist feature toggles, KYC, and payment settings.');
        applyCenterFeatureSettings();
        renderMonthlyReportPanel();
        renderComplianceDashboard();
      }
      function getSavedReportsForScope(centerId = 'guest', branchId = 'default') {
        try {
          const raw = localStorage.getItem(`${REPORT_STORAGE_KEY_PREFIX}__${centerId}__${branchId}`);
          const parsed = JSON.parse(raw || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          return [];
        }
      }
      function getAllReportsForCenter(center) {
        return (center?.branches || []).flatMap((branch) => getSavedReportsForScope(center.id, branch.id).map((report) => ({ ...report, _branchName: branch.name })));
      }
      function getSuperAdminSession() {
        try {
          const raw = localStorage.getItem(SUPER_ADMIN_SESSION_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch (_) {
          return null;
        }
      }
      function persistSuperAdminSession(session) {
        if (!session) {
          localStorage.removeItem(SUPER_ADMIN_SESSION_KEY);
          return;
        }
        localStorage.setItem(SUPER_ADMIN_SESSION_KEY, JSON.stringify(session));
      }
      function isSuperAdminUnlocked() {
        return !!getSuperAdminSession();
      }
      function getEffectiveCenterFeatureState(center = getCurrentCenter()) {
        const settings = center ? ensureCenterSettings(center) : getDefaultCenterSettings();
        const platform = settings.platform || getDefaultCenterPlatform();
        const paymentStatus = settings.payments?.status || 'Inactive';
        const disabled = platform.state === 'Disabled';
        const premiumLocked = !!platform.autoLockOnOverdue && ['Overdue', 'Suspended'].includes(paymentStatus);
        return {
          doctorSignature: settings.features.doctorSignature && !disabled,
          centerLabels: settings.features.centerLabels && !disabled,
          monthlyReports: settings.features.monthlyReports && !premiumLocked && !disabled,
          kyc: settings.features.kyc && !disabled,
          payments: settings.features.payments && !disabled,
          whatsappShare: settings.features.whatsappShare && !premiumLocked && !disabled,
          patientMaster: settings.features.patientMaster && !premiumLocked && !disabled,
          premiumLocked,
          disabled,
          paymentStatus,
          platformState: platform.state,
          lockReason: disabled ? 'Center access disabled by owner console.' : (premiumLocked ? `Premium features locked because billing status is ${paymentStatus}.` : '')
        };
      }
      function buildSuperAdminMetrics() {
        const centers = getCenters();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const breakdown = centers.map((center) => {
          const settings = ensureCenterSettings(center);
          const allReports = getAllReportsForCenter(center);
          const monthReports = allReports.filter((report) => {
            const stamp = new Date(report.updatedAt || report.createdAt || now.toISOString());
            return !Number.isNaN(stamp.getTime()) && stamp >= monthStart;
          });
          const finalCount = monthReports.filter((report) => report.status === 'Final').length;
          const amendedCount = monthReports.filter((report) => report.status === 'Amended').length;
          const draftCount = monthReports.filter((report) => report.status === 'Draft').length;
          const uniquePatients = new Set(monthReports.map((report) => `${report.patientName || ''}__${report.patientId || ''}`)).size;
          const effective = getEffectiveCenterFeatureState(center);
          return {
            center,
            centerId: center.id,
            displayName: center.displayName,
            branchCount: center.branches?.length || 0,
            userCount: center.users?.length || 0,
            monthReports: monthReports.length,
            finalCount,
            amendedCount,
            draftCount,
            uniquePatients,
            plan: settings.payments.plan || 'Starter',
            paymentStatus: settings.payments.status || 'Inactive',
            kycStatus: settings.kyc.status || 'Pending',
            state: settings.platform.state || 'Active',
            premiumLocked: effective.premiumLocked
          };
        });
        return {
          centersCount: centers.length,
          activeCenters: breakdown.filter((item) => item.state !== 'Disabled').length,
          disabledCenters: breakdown.filter((item) => item.state === 'Disabled').length,
          overdueCenters: breakdown.filter((item) => item.paymentStatus === 'Overdue').length,
          suspendedCenters: breakdown.filter((item) => item.paymentStatus === 'Suspended').length,
          branchCount: centers.reduce((sum, center) => sum + (center.branches?.length || 0), 0),
          userCount: centers.reduce((sum, center) => sum + (center.users?.length || 0), 0),
          currentMonthReports: breakdown.reduce((sum, item) => sum + item.monthReports, 0),
          breakdown,
          monthLabel: now.toLocaleString('en-GB', { month: 'long', year: 'numeric' })
        };
      }
      function getSelectedSuperAdminCenter() {
        if (selectedSuperAdminCenterId === '__new__') return null;
        const centers = getCenters();
        const selected = centers.find((center) => center.id === selectedSuperAdminCenterId) || null;
        if (selected) return selected;
        return centers[0] || null;
      }
      function populateSuperAdminCenterOptions() {
        const centers = getCenters();
        const options = ['<option value="__new__">+ Create New Center</option>'].concat(centers.map((center) => `<option value="${center.id}">${escapeHtml(center.displayName)}</option>`));
        setHtml('superAdminCenterSelect', options.join(''));
        if ($('superAdminCenterSelect')) $('superAdminCenterSelect').value = selectedSuperAdminCenterId;
      }
      function renderSuperAdminCenterEditor() {
        var center = getSelectedSuperAdminCenter();
        var settings = center ? ensureCenterSettings(center) : getDefaultCenterSettings();
        if ($('superAdminDisplayName')) $('superAdminDisplayName').value = center && center.displayName ? center.displayName : '';
        if ($('superAdminCenterIdInput')) {
          $('superAdminCenterIdInput').value = center && center.id ? center.id : '';
          $('superAdminCenterIdInput').disabled = !!center;
        }
        if ($('superAdminCenterPassword')) $('superAdminCenterPassword').value = center && center.password ? center.password : 'demo123';
        if ($('superAdminCenterState')) $('superAdminCenterState').value = settings.platform && settings.platform.state ? settings.platform.state : 'Active';
        if ($('superAdminKycStatus')) $('superAdminKycStatus').value = settings.kyc && settings.kyc.status ? settings.kyc.status : 'Pending';
        if ($('superAdminPlan')) $('superAdminPlan').value = settings.payments && settings.payments.plan ? settings.payments.plan : 'Starter';
        if ($('superAdminBillingStatus')) $('superAdminBillingStatus').value = settings.payments && settings.payments.status ? settings.payments.status : 'Inactive';
        if ($('superAdminMonthlyFee')) $('superAdminMonthlyFee').value = settings.payments && settings.payments.monthlyFee ? settings.payments.monthlyFee : '0';
        if ($('superAdminAutoLockOnOverdue')) $('superAdminAutoLockOnOverdue').checked = !!(settings.platform && settings.platform.autoLockOnOverdue);
        if ($('superAdminOwnerNote')) $('superAdminOwnerNote').value = settings.platform && settings.platform.ownerNote ? settings.platform.ownerNote : '';
        if ($('superAdminToggleDoctorSignature')) $('superAdminToggleDoctorSignature').checked = !!(settings.features && settings.features.doctorSignature);
        if ($('superAdminToggleCenterLabels')) $('superAdminToggleCenterLabels').checked = !!(settings.features && settings.features.centerLabels);
        if ($('superAdminToggleMonthlyReports')) $('superAdminToggleMonthlyReports').checked = !!(settings.features && settings.features.monthlyReports);
        if ($('superAdminToggleKyc')) $('superAdminToggleKyc').checked = !!(settings.features && settings.features.kyc);
        if ($('superAdminTogglePayments')) $('superAdminTogglePayments').checked = !!(settings.features && settings.features.payments);
        if ($('superAdminToggleWhatsappShare')) $('superAdminToggleWhatsappShare').checked = !!(settings.features && settings.features.whatsappShare);
        if ($('superAdminTogglePatientMaster')) $('superAdminTogglePatientMaster').checked = !!(settings.features && settings.features.patientMaster);

        var reports = center ? getAllReportsForCenter(center) : [];
        var effective = center ? getEffectiveCenterFeatureState(center) : null;
        if (center) {
          setHtml('superAdminCenterInfo', '<div><strong>' + escapeHtml(center.displayName) + '</strong> • ' + escapeHtml(center.id) + '</div>'
            + '<div><strong>Branches:</strong> ' + escapeHtml(String((center.branches || []).length))
            + ' • <strong>Users:</strong> ' + escapeHtml(String((center.users || []).length))
            + ' • <strong>Total reports:</strong> ' + escapeHtml(String(reports.length)) + '</div>'
            + '<div><strong>Plan:</strong> ' + escapeHtml((settings.payments && settings.payments.plan) || 'Starter')
            + ' • <strong>Billing:</strong> ' + escapeHtml((settings.payments && settings.payments.status) || 'Inactive')
            + ' • <strong>KYC:</strong> ' + escapeHtml((settings.kyc && settings.kyc.status) || 'Pending') + '</div>'
            + '<div><strong>Feature state:</strong> ' + escapeHtml((effective && effective.lockReason) || 'No remote lock active.') + '</div>');
        } else {
          setHtml('superAdminCenterInfo', 'Create a new center profile, assign subscription state, and define remote feature access.');
        }

        if ($('superAdminCenterUserName')) $('superAdminCenterUserName').value = '';
        if ($('superAdminCenterUserRole')) $('superAdminCenterUserRole').value = 'admin';

        if (!center) {
          setHtml('superAdminUserList', '<div class="superadmin-disabled-note">Create or select a center to manage users and roles.</div>');
          return;
        }

        var usersHtml = (center.users || []).map(function(user) {
          return '<div class="superadmin-user-item">'
            + '<div class="superadmin-user-copy"><strong>' + escapeHtml(user.name) + '</strong><br>' + escapeHtml((ROLE_DEFINITIONS[user.role] && ROLE_DEFINITIONS[user.role].label) || user.role) + '</div>'
            + '<div class="saved-report-actions">'
            + '<button class="mini-btn" data-superadmin-user-action="edit" data-center-id="' + escapeHtml(center.id) + '" data-user-name="' + escapeHtml(user.name) + '" data-user-role="' + escapeHtml(user.role) + '">Edit</button>'
            + '<button class="mini-btn" data-superadmin-user-action="remove" data-center-id="' + escapeHtml(center.id) + '" data-user-name="' + escapeHtml(user.name) + '">Remove</button>'
            + '</div></div>';
        }).join('');
        setHtml('superAdminUserList', usersHtml || '<div class="superadmin-disabled-note">No center users added yet.</div>');
      }
      function renderSuperAdminRoster(metrics) {
        var unlocked = isSuperAdminUnlocked();
        var html = (metrics.breakdown || []).map(function(item) {
          var stateBadge = item.state === 'Disabled'
            ? makeBadge('Disabled', 'badge-red')
            : makeBadge(item.paymentStatus, (item.paymentStatus === 'Active' || item.paymentStatus === 'Trial') ? 'badge-green' : ((item.paymentStatus === 'Due' || item.paymentStatus === 'Overdue') ? 'badge-amber' : 'badge-red'));
          var premiumBadge = item.premiumLocked ? makeBadge('Premium locked', 'badge-red') : makeBadge('Feature open', 'badge-green');
          var disableLabel = item.state === 'Disabled' ? 'Enable' : 'Disable';
          var suspendLabel = item.paymentStatus === 'Suspended' ? 'Unsuspend' : 'Suspend';
          return '<div class="superadmin-roster-item">'
            + '<div class="superadmin-roster-head"><div><div class="superadmin-roster-title">' + escapeHtml(item.displayName) + '</div><div class="superadmin-roster-sub">' + escapeHtml(item.centerId) + ' • ' + escapeHtml(item.plan) + ' • KYC ' + escapeHtml(item.kycStatus) + '</div></div><div>' + stateBadge + '</div></div>'
            + '<div class="superadmin-inline-meta"><span class="timeline-chip">Branches: ' + escapeHtml(String(item.branchCount)) + '</span><span class="timeline-chip">Users: ' + escapeHtml(String(item.userCount)) + '</span><span class="timeline-chip">' + escapeHtml(metrics.monthLabel) + ': ' + escapeHtml(String(item.monthReports)) + ' report(s)</span><span class="timeline-chip">Unique patients: ' + escapeHtml(String(item.uniquePatients)) + '</span></div>'
            + '<div class="superadmin-inline-meta" style="margin-top:10px;">' + premiumBadge + '</div>'
            + '<div class="saved-report-actions" style="margin-top:10px;">'
            + '<button class="mini-btn" data-superadmin-roster-action="select" data-center-id="' + escapeHtml(item.centerId) + '" ' + (unlocked ? '' : 'disabled') + '>Select</button>'
            + '<button class="mini-btn" data-superadmin-roster-action="toggle-disable" data-center-id="' + escapeHtml(item.centerId) + '" ' + (unlocked ? '' : 'disabled') + '>' + disableLabel + '</button>'
            + '<button class="mini-btn" data-superadmin-roster-action="toggle-suspend" data-center-id="' + escapeHtml(item.centerId) + '" ' + (unlocked ? '' : 'disabled') + '>' + suspendLabel + '</button>'
            + '<button class="mini-btn" data-superadmin-roster-action="approve-kyc" data-center-id="' + escapeHtml(item.centerId) + '" ' + (unlocked ? '' : 'disabled') + '>Approve KYC</button>'
            + '</div></div>';
        }).join('');
        setHtml('superAdminCenterRoster', html || '<div class="superadmin-disabled-note">No centers available.</div>');
      }
      function renderSuperAdminConsole() {
        if (!$('superAdminConsoleCard')) return;
        var session = getSuperAdminSession();
        var unlocked = !!session;
        if ($('superAdminUserName')) $('superAdminUserName').value = (session && session.ownerName) || $('superAdminUserName').value || 'Platform Owner';
        if ($('superAdminPin')) $('superAdminPin').value = '';
        populateSuperAdminCenterOptions();
        var metrics = buildSuperAdminMetrics();
        var chips = [
          ['Centers', metrics.centersCount],
          ['Active', metrics.activeCenters],
          ['Disabled', metrics.disabledCenters],
          ['Overdue', metrics.overdueCenters],
          ['Suspended', metrics.suspendedCenters],
          ['Branches', metrics.branchCount],
          ['Users', metrics.userCount],
          [metrics.monthLabel + ' reports', metrics.currentMonthReports]
        ];
        setHtml('superAdminMetricsGrid', chips.map(function(pair) {
          return '<div class="monthly-report-chip"><strong>' + escapeHtml(pair[0]) + '</strong>' + escapeHtml(String(pair[1])) + '</div>';
        }).join(''));
        setHtml('superAdminMonthlyBreakdown', (metrics.breakdown || []).map(function(item) {
          return '<div class="monthly-report-item"><strong>' + escapeHtml(item.displayName) + '</strong> • ' + escapeHtml(item.plan) + ' • Billing ' + escapeHtml(item.paymentStatus) + ' • KYC ' + escapeHtml(item.kycStatus) + ' • ' + escapeHtml(metrics.monthLabel) + ': ' + escapeHtml(String(item.monthReports)) + ' report(s), ' + escapeHtml(String(item.finalCount)) + ' final, ' + escapeHtml(String(item.amendedCount)) + ' amended, ' + escapeHtml(String(item.draftCount)) + ' draft.</div>';
        }).join('') || '<div class="monthly-report-item">No center analytics available yet.</div>');
        if (!selectedSuperAdminCenterId || (selectedSuperAdminCenterId !== '__new__' && !getCenters().some(function(center) { return center.id === selectedSuperAdminCenterId; }))) selectedSuperAdminCenterId = '__new__';
        renderSuperAdminCenterEditor();
        renderSuperAdminRoster(metrics);
        if (unlocked) {
          setHtml('superAdminSessionInfo', 'Owner console unlocked for <strong>' + escapeHtml((session && session.ownerName) || 'Platform Owner') + '</strong>. Central controls now apply across all centers in this browser.');
        } else {
          setHtml('superAdminSessionInfo', 'Owner console is locked. Demo owner PIN: <strong>' + escapeHtml(SUPER_ADMIN_PIN) + '</strong>. Unlock to create / disable centers, approve KYC, control subscriptions, and remote-manage premium features.');
        }
        var controlIds = ['superAdminCenterSelect','superAdminDisplayName','superAdminCenterIdInput','superAdminCenterPassword','superAdminCenterState','superAdminKycStatus','superAdminPlan','superAdminBillingStatus','superAdminMonthlyFee','superAdminAutoLockOnOverdue','superAdminOwnerNote','superAdminToggleDoctorSignature','superAdminToggleCenterLabels','superAdminToggleMonthlyReports','superAdminToggleKyc','superAdminTogglePayments','superAdminToggleWhatsappShare','superAdminTogglePatientMaster','saveSuperAdminCenterBtn','resetSuperAdminCenterFormBtn','superAdminApproveKycBtn','superAdminSuspendCenterBtn','superAdminReactivateCenterBtn','superAdminCenterUserName','superAdminCenterUserRole','saveSuperAdminUserBtn'];
        controlIds.forEach(function(id) { if ($(id)) $(id).disabled = !unlocked; });
        if ($('superAdminUnlockBtn')) $('superAdminUnlockBtn').disabled = unlocked;
        if ($('superAdminLockBtn')) $('superAdminLockBtn').disabled = !unlocked;
      }
      function unlockSuperAdminConsole() {
        const pin = $('superAdminPin')?.value || '';
        if (pin !== SUPER_ADMIN_PIN) {
          setHtml('superAdminSessionInfo', 'Incorrect owner PIN. Demo owner PIN is <strong>owner123</strong>.');
          return;
        }
        persistSuperAdminSession({ ownerName: ($('superAdminUserName')?.value || 'Platform Owner').trim() || 'Platform Owner', unlockedAt: new Date().toISOString() });
        renderSuperAdminConsole();
      }
      function lockSuperAdminConsole() {
        persistSuperAdminSession(null);
        renderSuperAdminConsole();
      }
      function readSuperAdminFeatureForm() {
        return {
          doctorSignature: !!$('superAdminToggleDoctorSignature')?.checked,
          centerLabels: !!$('superAdminToggleCenterLabels')?.checked,
          monthlyReports: !!$('superAdminToggleMonthlyReports')?.checked,
          kyc: !!$('superAdminToggleKyc')?.checked,
          payments: !!$('superAdminTogglePayments')?.checked,
          whatsappShare: !!$('superAdminToggleWhatsappShare')?.checked,
          patientMaster: !!$('superAdminTogglePatientMaster')?.checked
        };
      }
      function saveSuperAdminCenter() {
        if (!isSuperAdminUnlocked()) return;
        const centers = getCenters();
        const existing = getSelectedSuperAdminCenter();
        const displayName = ($('superAdminDisplayName')?.value || '').trim();
        if (!displayName) {
          setHtml('superAdminCenterInfo', 'Center display name is required.');
          return;
        }
        const centerIdInput = ($('superAdminCenterIdInput')?.value || '').trim();
        const newCenterId = centerIdInput ? slugifyKey(centerIdInput) : slugifyKey(displayName);
        if (!existing && centers.some((center) => center.id === newCenterId)) {
          setHtml('superAdminCenterInfo', 'Center ID already exists. Use another ID or select the existing center.');
          return;
        }
        const target = existing || {
          id: newCenterId,
          displayName,
          password: 'demo123',
          profile: { clinic: displayName, tagline: 'Advanced Obstetric Imaging • Fetal Screening • Doppler', prefix: displayName.slice(0, 3).toUpperCase() || 'CTR', consultant: 'Dr Consultant Name, MD Radiodiagnosis', registration: 'Reg. No: XXXXX', logo: (displayName.slice(0, 2) || 'CT').toUpperCase() },
          branches: [{ id: 'main', name: 'Main Branch', address: 'Main Branch', contact: '+91 00000 00000', website: '' }],
          users: getDefaultCenterUsers({ profile: { consultant: 'Dr Consultant Name, MD Radiodiagnosis' } })
        };
        target.displayName = displayName;
        target.password = ($('superAdminCenterPassword')?.value || 'demo123').trim() || 'demo123';
        target.profile = target.profile || {};
        target.profile.clinic = displayName;
        target.profile.prefix = target.profile.prefix || displayName.slice(0, 3).toUpperCase() || 'CTR';
        target.profile.logo = target.profile.logo || (displayName.slice(0, 2) || 'CT').toUpperCase();
        const settings = ensureCenterSettings(target);
        settings.features = readSuperAdminFeatureForm();
        settings.kyc.status = $('superAdminKycStatus')?.value || 'Pending';
        settings.payments.plan = $('superAdminPlan')?.value || 'Starter';
        settings.payments.status = $('superAdminBillingStatus')?.value || 'Inactive';
        settings.payments.monthlyFee = $('superAdminMonthlyFee')?.value || '0';
        settings.platform.state = $('superAdminCenterState')?.value || 'Active';
        settings.platform.autoLockOnOverdue = !!$('superAdminAutoLockOnOverdue')?.checked;
        settings.platform.ownerNote = ($('superAdminOwnerNote')?.value || '').trim();
        settings.platform.lastOwnerReviewAt = new Date().toISOString();
        if (!existing) centers.push(target);
        persistCenters(centers);
        selectedSuperAdminCenterId = target.id;
        renderSuperAdminConsole();
        populateCenterOptions();
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
        renderSavedReports();
      }
      function setSuperAdminCenterModeNew() {
        selectedSuperAdminCenterId = '__new__';
        renderSuperAdminConsole();
      }
      function applySuperAdminQuickAction(centerId, action) {
        if (!isSuperAdminUnlocked()) return;
        const centers = getCenters();
        const center = centers.find((item) => item.id === centerId);
        if (!center) return;
        const settings = ensureCenterSettings(center);
        if (action === 'approve-kyc') settings.kyc.status = 'Verified';
        if (action === 'toggle-disable') settings.platform.state = settings.platform.state === 'Disabled' ? 'Active' : 'Disabled';
        if (action === 'toggle-suspend') settings.payments.status = settings.payments.status === 'Suspended' ? 'Active' : 'Suspended';
        settings.platform.lastOwnerReviewAt = new Date().toISOString();
        persistCenters(centers);
        selectedSuperAdminCenterId = center.id;
        renderSuperAdminConsole();
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
      }
      function saveSuperAdminUser() {
        if (!isSuperAdminUnlocked()) return;
        const center = getSelectedSuperAdminCenter();
        if (!center) {
          setHtml('superAdminCenterInfo', 'Select an existing center before adding a user.');
          return;
        }
        const userName = ($('superAdminCenterUserName')?.value || '').trim();
        const role = $('superAdminCenterUserRole')?.value || 'admin';
        if (!userName) return;
        const centers = getCenters();
        const target = centers.find((item) => item.id === center.id);
        if (!target) return;
        target.users = Array.isArray(target.users) ? target.users : [];
        const existingUser = target.users.find((user) => user.name.toLowerCase() === userName.toLowerCase());
        if (existingUser) existingUser.role = role;
        else target.users.push({ name: userName, role });
        persistCenters(centers);
        selectedSuperAdminCenterId = center.id;
        renderSuperAdminConsole();
      }
      function handleSuperAdminUserAction(action, centerId, userName, userRole = 'admin') {
        if (!isSuperAdminUnlocked()) return;
        if (action === 'edit') {
          selectedSuperAdminCenterId = centerId;
          renderSuperAdminConsole();
          if ($('superAdminCenterUserName')) $('superAdminCenterUserName').value = userName;
          if ($('superAdminCenterUserRole')) $('superAdminCenterUserRole').value = userRole;
          return;
        }
        if (action === 'remove') {
          const centers = getCenters();
          const center = centers.find((item) => item.id === centerId);
          if (!center) return;
          center.users = (center.users || []).filter((user) => user.name.toLowerCase() !== String(userName || '').toLowerCase());
          persistCenters(centers);
          selectedSuperAdminCenterId = centerId;
          renderSuperAdminConsole();
        }
      }
      function applyCenterFeatureSettings() {
        const center = getCurrentCenter();
        const settings = getCurrentCenterSettings();
        const effective = getEffectiveCenterFeatureState(center);
        const canPersist = !!center && hasPermission('manageCenter');
        ['settingEnableDoctorSignature','settingEnableCenterLabels','settingEnableMonthlyReports','settingEnableKyc','settingEnablePayments','settingEnableWhatsappShare','settingEnablePatientMaster','settingKycOwnerName','settingKycBusinessName','settingKycRegistrationId','settingKycTaxId','settingKycBillingEmail','settingKycBillingPhone','settingKycStatus','settingPaymentPlan','settingMonthlyFee','settingPaymentStatus','settingBillingDay','settingLastPaidOn','settingNextDueOn','settingPaymentReference'].forEach((id) => { if ($(id)) $(id).disabled = !canPersist; });
        if ($('saveCenterSettingsBtn')) $('saveCenterSettingsBtn').disabled = !canPersist;
        if ($('resetCenterSettingsBtn')) $('resetCenterSettingsBtn').disabled = !canPersist;
        if ($('refreshMonthlyReportBtn')) $('refreshMonthlyReportBtn').disabled = !(center && effective.monthlyReports);
        if ($('showSignatureToggle')) $('showSignatureToggle').checked = !!effective.doctorSignature;
        if ($('toggleBrandingGlobal')) $('toggleBrandingGlobal').checked = !!effective.centerLabels;
        if ($('openWhatsAppShareBtn')) $('openWhatsAppShareBtn').disabled = !(hasPermission('print') && effective.whatsappShare);
        if ($('downloadSignedPdfBtn')) $('downloadSignedPdfBtn').disabled = !(hasPermission('print') && effective.whatsappShare);
        if ($('copyWhatsAppTextBtn')) $('copyWhatsAppTextBtn').disabled = !(hasPermission('print') && effective.whatsappShare);
        if ($('whatsappNumber')) $('whatsappNumber').disabled = !effective.whatsappShare;
        if ($('whatsappMode')) $('whatsappMode').disabled = !effective.whatsappShare;
        if ($('patientMasterCard')) $('patientMasterCard').style.display = effective.patientMaster ? '' : 'none';
        if ($('monthlyReportsPanel')) $('monthlyReportsPanel').style.display = effective.monthlyReports ? '' : 'none';
        if ($('centerKycPanel')) $('centerKycPanel').style.display = effective.kyc ? '' : 'none';
        if ($('centerPaymentsPanel')) $('centerPaymentsPanel').style.display = effective.payments ? '' : 'none';
        updatePrintAssetPreferences();
        toggleBranding();
      }
      function saveCenterSettingsFromPanel() {
        const center = getCurrentCenter();
        if (!center || !hasPermission('manageCenter')) return;
        const centers = getCenters();
        const target = centers.find((item) => item.id === center.id);
        if (!target) return;
        const settings = ensureCenterSettings(target);
        settings.features = {
          doctorSignature: !!$('settingEnableDoctorSignature')?.checked,
          centerLabels: !!$('settingEnableCenterLabels')?.checked,
          monthlyReports: !!$('settingEnableMonthlyReports')?.checked,
          kyc: !!$('settingEnableKyc')?.checked,
          payments: !!$('settingEnablePayments')?.checked,
          whatsappShare: !!$('settingEnableWhatsappShare')?.checked,
          patientMaster: !!$('settingEnablePatientMaster')?.checked
        };
        settings.kyc = {
          ownerName: $('settingKycOwnerName')?.value?.trim() || '',
          businessName: $('settingKycBusinessName')?.value?.trim() || '',
          registrationId: $('settingKycRegistrationId')?.value?.trim() || '',
          taxId: $('settingKycTaxId')?.value?.trim() || '',
          billingEmail: $('settingKycBillingEmail')?.value?.trim() || '',
          billingPhone: $('settingKycBillingPhone')?.value?.trim() || '',
          status: $('settingKycStatus')?.value || 'Pending'
        };
        settings.payments = {
          plan: $('settingPaymentPlan')?.value || 'Starter',
          monthlyFee: $('settingMonthlyFee')?.value || '0',
          status: $('settingPaymentStatus')?.value || 'Inactive',
          billingDay: $('settingBillingDay')?.value || '5',
          lastPaidOn: $('settingLastPaidOn')?.value || '',
          nextDueOn: $('settingNextDueOn')?.value || '',
          paymentReference: $('settingPaymentReference')?.value?.trim() || ''
        };
        persistCenters(centers);
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
      }
      function resetCenterSettingsToDefaults() {
        const center = getCurrentCenter();
        if (!center || !hasPermission('manageCenter')) return;
        const centers = getCenters();
        const target = centers.find((item) => item.id === center.id);
        if (!target) return;
        target.settings = getDefaultCenterSettings(target);
        persistCenters(centers);
        loadCenterSettingsIntoPanel();
      }
      function buildMonthlyReportData() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const reports = getSavedReports().filter((report) => {
          const stamp = new Date(report.updatedAt || report.createdAt || now.toISOString());
          return !Number.isNaN(stamp.getTime()) && stamp >= monthStart;
        });
        const tabCounts = { nt: 0, level2: 0, biometry: 0, obdoppler: 0, twins: 0 };
        reports.forEach((report) => { if (Object.prototype.hasOwnProperty.call(tabCounts, report.reportType)) tabCounts[report.reportType] += 1; });
        const patients = new Set(reports.map((report) => `${report.patientName || ''}__${report.patientId || ''}`));
        const finals = reports.filter((report) => report.status === 'Final').length;
        const amended = reports.filter((report) => report.status === 'Amended').length;
        const drafts = reports.filter((report) => report.status === 'Draft').length;
        return { total: reports.length, uniquePatients: patients.size, finals, amended, drafts, tabCounts, monthLabel: now.toLocaleString('en-GB', { month: 'long', year: 'numeric' }) };
      }
      function renderMonthlyReportPanel() {
        const center = getCurrentCenter();
        const settings = getCurrentCenterSettings();
        if (!center) {
          setHtml('monthlyReportSummary', 'Sign in to a center to generate current-month report analytics for that center and active branch.');
          setHtml('monthlyReportGrid', '');
          setHtml('monthlyReportBreakdown', '');
          return;
        }
        if (!settings.features.monthlyReports) {
          setHtml('monthlyReportSummary', 'Monthly reports are currently disabled for this center. Enable the monthly data reports toggle to view scoped analytics.');
          setHtml('monthlyReportGrid', '');
          setHtml('monthlyReportBreakdown', '');
          return;
        }
        const branch = getCurrentBranch(center);
        const data = buildMonthlyReportData();
        setHtml('monthlyReportSummary', `<strong>${escapeHtml(data.monthLabel)}</strong> analytics for <strong>${escapeHtml(center.displayName)}</strong> • <strong>${escapeHtml(branch?.name || 'Default branch')}</strong>.`);
        const chips = [
          ['Total reports', data.total],
          ['Unique patients', data.uniquePatients],
          ['Finalized', data.finals],
          ['Amended', data.amended],
          ['Draft', data.drafts],
          ['NT + Level II', data.tabCounts.nt + data.tabCounts.level2]
        ];
        setHtml('monthlyReportGrid', chips.map(([label, value]) => `<div class="monthly-report-chip"><strong>${escapeHtml(label)}</strong>${escapeHtml(String(value))}</div>`).join(''));
        const breakdown = [
          `NT scans: ${data.tabCounts.nt}`,
          `Level II scans: ${data.tabCounts.level2}`,
          `Routine biometry: ${data.tabCounts.biometry}`,
          `Obstetric + Doppler: ${data.tabCounts.obdoppler}`,
          `Twin reports: ${data.tabCounts.twins}`,
          `Current payment status: ${escapeHtml(settings.payments.status || 'Inactive')}`,
          `KYC status: ${escapeHtml(settings.kyc.status || 'Pending')}`
        ];
        setHtml('monthlyReportBreakdown', breakdown.map((line) => `<div class="monthly-report-item">${line}</div>`).join(''));
      }
      function getIsoAgeDays(value) {
        const stamp = new Date(value || 0).getTime();
        if (!stamp || Number.isNaN(stamp)) return 0;
        return Math.max(0, Math.floor((Date.now() - stamp) / 86400000));
      }
      function getLinkedFormFForReport(report, forms = getSavedFormFs()) {
        return (forms || []).find((item) => item.linkedReportStorageId === report.id || (report.reportPublicId && item.linkedReportPublicId === report.reportPublicId)) || null;
      }
      function getSavedFormFIssues(record) {
        const data = record?.data || {};
        const issues = [];
        if (!String(data.formFPatientName || '').trim()) issues.push('Patient name missing');
        if (!String(data.formFPatientId || '').trim()) issues.push('Patient UHID missing');
        if (!String(data.formFScanDate || '').trim()) issues.push('Procedure date missing');
        if (!String(data.formFProcedureType || '').trim()) issues.push('Procedure type missing');
        if (!String(data.formFIndication || '').trim()) issues.push('Indication missing');
        if (!String(data.formFClinicalSummary || '').trim()) issues.push('Brief report / clinical summary missing');
        return issues;
      }
      function buildComplianceDashboardData() {
        const reports = getSavedReports().slice();
        const forms = getSavedFormFs().slice();
        const today = new Date().toISOString().slice(0, 10);
        const monthKey = getMonthKeyFromValue(today);
        const todayReports = reports.filter((report) => {
          const latest = report.versions?.[report.versions.length - 1] || {};
          const meta = extractVisitMetaFromVersion(report, latest);
          return (meta.scanDate || '') === today;
        }).length;
        const monthReports = reports.filter((report) => getReportMonthKey(report) === monthKey).length;
        const finalizedReports = reports.filter((report) => ['Final', 'Amended'].includes(report.status)).length;
        const missingFormFReports = reports.filter((report) => !getLinkedFormFForReport(report, forms));
        const finalWithoutFormFReports = reports.filter((report) => ['Final', 'Amended'].includes(report.status) && !getLinkedFormFForReport(report, forms));
        const draftReports = reports.filter((report) => report.status === 'Draft');
        const incompleteFormFs = forms.filter((record) => getSavedFormFIssues(record).length > 0);
        const draftFormFs = forms.filter((record) => String(record.status || 'Draft') === 'Draft');
        const pendingItems = [];
        reports.forEach((report) => {
          const latest = report.versions?.[report.versions.length - 1] || {};
          const meta = extractVisitMetaFromVersion(report, latest);
          const ageDays = getIsoAgeDays(report.updatedAt || latest.timestamp || report.createdAt);
          const linkedForm = getLinkedFormFForReport(report, forms);
          if (report.status === 'Draft') {
            pendingItems.push({
              key: `report-draft-${report.id}`,
              kind: 'report',
              reportId: report.id,
              formId: '',
              severity: ageDays >= 1 ? 'High' : 'Medium',
              issue: ageDays >= 1 ? 'Draft report pending finalization beyond 24 hours.' : 'Draft report pending finalization.',
              patientName: report.patientName || 'Unnamed Patient',
              patientId: report.patientId || 'No ID',
              reportPublicId: getSavedReportPublicId(report),
              status: report.status || 'Draft',
              scanDate: meta.scanDate || '',
              updatedAt: report.updatedAt || latest.timestamp || report.createdAt || '',
              ageDays
            });
          }
          if (!linkedForm) {
            pendingItems.push({
              key: `report-formf-${report.id}`,
              kind: 'report',
              reportId: report.id,
              formId: '',
              severity: ['Final', 'Amended'].includes(report.status) ? 'High' : 'Medium',
              issue: ['Final', 'Amended'].includes(report.status) ? 'Final / amended report has no linked Form F.' : 'Report saved without linked Form F.',
              patientName: report.patientName || 'Unnamed Patient',
              patientId: report.patientId || 'No ID',
              reportPublicId: getSavedReportPublicId(report),
              status: report.status || 'Draft',
              scanDate: meta.scanDate || '',
              updatedAt: report.updatedAt || latest.timestamp || report.createdAt || '',
              ageDays
            });
          }
        });
        forms.forEach((record) => {
          const ageDays = getIsoAgeDays(record.updatedAt || record.createdAt);
          const issues = getSavedFormFIssues(record);
          const linkedReport = reports.find((report) => report.id === record.linkedReportStorageId || (record.linkedReportPublicId && report.reportPublicId === record.linkedReportPublicId)) || null;
          if (issues.length) {
            pendingItems.push({
              key: `formf-issues-${record.id}`,
              kind: 'formf',
              reportId: linkedReport?.id || '',
              formId: record.id,
              severity: ageDays >= 1 ? 'High' : 'Medium',
              issue: 'Saved Form F is incomplete: ' + issues.join(', ') + '.',
              patientName: record.patientName || linkedReport?.patientName || 'Unnamed Patient',
              patientId: record.patientId || linkedReport?.patientId || 'No ID',
              reportPublicId: record.linkedReportPublicId || linkedReport?.reportPublicId || '-',
              status: record.status || 'Draft',
              scanDate: record.data?.formFScanDate || '',
              updatedAt: record.updatedAt || record.createdAt || '',
              ageDays
            });
          }
          if (String(record.status || 'Draft') === 'Draft') {
            pendingItems.push({
              key: `formf-draft-${record.id}`,
              kind: 'formf',
              reportId: linkedReport?.id || '',
              formId: record.id,
              severity: ageDays >= 1 ? 'High' : 'Medium',
              issue: linkedReport ? 'Linked Form F remains in draft status.' : 'Unlinked Form F remains in draft status.',
              patientName: record.patientName || linkedReport?.patientName || 'Unnamed Patient',
              patientId: record.patientId || linkedReport?.patientId || 'No ID',
              reportPublicId: record.linkedReportPublicId || linkedReport?.reportPublicId || '-',
              status: record.status || 'Draft',
              scanDate: record.data?.formFScanDate || '',
              updatedAt: record.updatedAt || record.createdAt || '',
              ageDays
            });
          }
        });
        const severityRank = { High: 3, Medium: 2, Low: 1 };
        pendingItems.sort((a, b) => {
          if ((severityRank[b.severity] || 0) !== (severityRank[a.severity] || 0)) return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
          if ((b.ageDays || 0) !== (a.ageDays || 0)) return (b.ageDays || 0) - (a.ageDays || 0);
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });
        const overdueIncompleteCount = pendingItems.filter((item) => item.ageDays >= 1).length;
        return {
          todayReports,
          monthReports,
          finalizedReports,
          missingFormFCount: missingFormFReports.length,
          finalWithoutFormFCount: finalWithoutFormFReports.length,
          draftReportCount: draftReports.length,
          draftFormFCount: draftFormFs.length,
          incompleteFormFCount: incompleteFormFs.length,
          overdueIncompleteCount,
          totalPendingCount: pendingItems.length,
          pendingItems: pendingItems.slice(0, 12)
        };
      }
      function renderComplianceDashboard() {
        const summaryEl = $('complianceDashboardSummary');
        const gridEl = $('complianceDashboardGrid');
        const listEl = $('compliancePendingList');
        if (!summaryEl || !gridEl || !listEl) return;
        const data = buildComplianceDashboardData();
        const center = getCurrentCenter();
        const branch = getCurrentBranch(center);
        const scopeLabel = getCurrentScopeLabel();
        const summaryText = data.totalPendingCount
          ? `<strong>${escapeHtml(scopeLabel)}</strong> has <strong>${escapeHtml(String(data.totalPendingCount))}</strong> active compliance worklist item(s); <strong>${escapeHtml(String(data.overdueIncompleteCount))}</strong> are overdue beyond 24 hours.`
          : `<strong>${escapeHtml(scopeLabel)}</strong> currently has no active compliance worklist item in the saved report / Form F scope.`;
        setHtml('complianceDashboardSummary', summaryText + (center ? ` <br><strong>Center:</strong> ${escapeHtml(center.displayName)} • <strong>Branch:</strong> ${escapeHtml(branch?.name || 'Default')}.` : ''));
        const chips = [
          ['Today reports', data.todayReports],
          ['This month', data.monthReports],
          ['Final / amended', data.finalizedReports],
          ['Draft reports', data.draftReportCount],
          ['Missing Form F', data.missingFormFCount],
          ['Final without Form F', data.finalWithoutFormFCount],
          ['Draft Form F', data.draftFormFCount],
          ['Incomplete Form F', data.incompleteFormFCount],
          ['Overdue items', data.overdueIncompleteCount]
        ];
        setHtml('complianceDashboardGrid', chips.map(([label, value]) => `<div class="monthly-report-chip"><strong>${escapeHtml(label)}</strong>${escapeHtml(String(value))}</div>`).join(''));
        if (!data.pendingItems.length) {
          setHtml('compliancePendingList', '<div class="saved-report-item"><div class="saved-report-sub">No pending compliance item is currently detected in the active center / branch scope.</div></div>');
          return;
        }
        setHtml('compliancePendingList', data.pendingItems.map((item) => {
          const tone = item.severity === 'High' ? 'badge-red' : (item.severity === 'Medium' ? 'badge-amber' : 'badge-green');
          const actions = [];
          if (item.reportId) actions.push(`<button class="mini-btn" data-compliance-action="load-report" data-report-id="${escapeHtml(item.reportId)}">Load report</button>`);
          if (item.formId) actions.push(`<button class="mini-btn" data-compliance-action="load-formf" data-formf-id="${escapeHtml(item.formId)}">Load Form F</button>`);
          return `<div class="saved-report-item"><div class="saved-report-item-header"><div><div class="saved-report-title">${escapeHtml(item.patientName)} • ${escapeHtml(item.reportPublicId || '-')}</div><div class="saved-report-sub">${escapeHtml(item.patientId || 'No ID')} • ${escapeHtml(formatDate(item.scanDate || item.updatedAt))} • ${escapeHtml(item.kind === 'formf' ? 'Form F' : 'Report')}</div></div><div>${makeBadge(item.severity, tone)}</div></div><div class="saved-report-sub">${escapeHtml(item.issue)}</div><div class="saved-report-sub">Status: ${escapeHtml(item.status || '-')} • Age: ${escapeHtml(String(item.ageDays || 0))} day(s)</div><div class="saved-report-actions">${actions.join('')}</div></div>`;
        }).join(''));
      }
      async function handleCenterLogin() {
        const centerId = $('centerLoginSelect')?.value || '';
        const password = $('centerPassword')?.value || '';
        const center = getCenters().find((item) => item.id === centerId);
        const enteredUserName = ($('centerUserName')?.value || '').trim() || 'Center User';
        let role = $('centerRoleSelect')?.value || 'consultant';
        if (!center) {
          setHtml('centerSessionInfo', 'Please select a center to sign in.');
          return;
        }
        ensureCenterSettings(center);
        const backendCfg = getBackendConfig();
        if (isBackendEnabled()) {
          try {
            const remotePayload = await attemptBackendCenterLogin(center, password, enteredUserName, role);
            if (remotePayload?.snapshot) hydrateScopeSnapshot(remotePayload.snapshot);
            if (remotePayload?.center) hydrateScopeSnapshot(remotePayload);
            if (remotePayload?.role) role = remotePayload.role;
            renderBackendStatus(`Backend center login succeeded for <strong>${escapeHtml(center.displayName)}</strong>.`);
          } catch (error) {
            if (backendCfg.mode === 'remote') {
              setHtml('centerSessionInfo', `Backend login failed for <strong>${escapeHtml(center.displayName)}</strong>: ${escapeHtml(error.message || 'Unknown error')}.`);
              renderBackendStatus(`Backend login failed for <strong>${escapeHtml(center.displayName)}</strong>: ${escapeHtml(error.message || 'Unknown error')}.`);
              return;
            }
            renderBackendStatus(`Backend login attempt failed; continuing with local sign-in for <strong>${escapeHtml(center.displayName)}</strong>. Reason: ${escapeHtml(error.message || 'Unknown error')}.`);
          }
        }
        if (center.password !== password && backendCfg.mode === 'local') {
          setHtml('centerSessionInfo', `Incorrect password for <strong>${escapeHtml(center.displayName)}</strong>. Demo password is <strong>demo123</strong>.`);
          return;
        }
        if (center.password !== password && backendCfg.mode !== 'local' && !getBackendConfig().authToken) {
          setHtml('centerSessionInfo', `Password mismatch for <strong>${escapeHtml(center.displayName)}</strong> and no backend session token is available.`);
          return;
        }
        const effective = getEffectiveCenterFeatureState(center);
        if (effective.disabled) {
          setHtml('centerSessionInfo', `Center access for <strong>${escapeHtml(center.displayName)}</strong> is currently disabled by the owner console.`);
          return;
        }
        const savedUser = (center.users || []).find((user) => user.name.toLowerCase() === enteredUserName.toLowerCase());
        role = savedUser?.role || role;
        if ($('centerRoleSelect')) $('centerRoleSelect').value = role;
        const firstBranch = center.branches[0] || { id: 'main', name: 'Main Branch', address: '', contact: '', website: '' };
        persistActiveCenterSession({ centerId: center.id, branchId: firstBranch.id, userName: enteredUserName, role });
        currentLoadedReportId = null;
        currentEditMode = 'normal';
        if ($('centerPassword')) $('centerPassword').value = '';
        setBrandInputsFromCenter(center, firstBranch);
        refreshBranding();
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
        renderSavedReports();
        renderVersionHistory(null);
        renderAuditTrail(null);
        updateCurrentReportInfo(null, null);
        renderFinalizeValidationBox();
        if (getBackendConfig().mode === 'remote') {
          try {
            await pullScopeFromBackend(true);
            renderBackendStatus(`Remote scope hydrated after center login for <strong>${escapeHtml(center.displayName)}</strong>.`);
          } catch (error) {
            renderBackendStatus(`Remote pull after login failed for <strong>${escapeHtml(center.displayName)}</strong>: ${escapeHtml(error.message || 'Unknown error')}.`);
          }
        }
      }

      function handleCenterLogout() {
        persistActiveCenterSession(null);
        currentLoadedReportId = null;
        currentEditMode = 'normal';
        if ($('centerPassword')) $('centerPassword').value = '';
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
        renderSavedReports();
        renderVersionHistory(null);
        renderAuditTrail(null);
        updateCurrentReportInfo(null, null);
      }

      function handleBranchSwitch() {
        const center = getCurrentCenter();
        if (!center) return;
        const branchId = $('centerBranchSelector')?.value || '';
        const branch = getCurrentBranch(center, branchId);
        if (!branch) return;
        const session = getActiveCenterSession();
        persistActiveCenterSession({
          centerId: center.id,
          branchId: branch.id,
          userName: session?.userName || 'Center User',
          role: session?.role || 'consultant'
        });
        currentLoadedReportId = null;
        currentEditMode = 'normal';
        setBrandInputsFromCenter(center, branch);
        refreshBranding();
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
        renderSavedReports();
        renderVersionHistory(null);
        renderAuditTrail(null);
        updateCurrentReportInfo(null, null);
      }

      function saveCenterProfileFromBranding() {
        const session = getActiveCenterSession();
        if (!session?.centerId) return;
        const centers = getCenters();
        const center = centers.find((item) => item.id === session.centerId);
        if (!center) return;
        center.profile = {
          clinic: $('brandClinicName').value.trim() || center.profile.clinic,
          tagline: $('brandTagline').value.trim() || center.profile.tagline,
          prefix: $('brandReportPrefix').value.trim() || center.profile.prefix,
          consultant: $('brandConsultant').value.trim() || center.profile.consultant,
          registration: $('brandRegistration').value.trim() || center.profile.registration,
          logo: ($('brandLogoText').value.trim() || center.profile.logo).slice(0, 3).toUpperCase()
        };
        persistCenters(centers);
        renderCenterSessionInfo();
        refreshBranding();
      }

      function saveBranchProfileFromBranding() {
        const session = getActiveCenterSession();
        if (!session?.centerId) return;
        const centers = getCenters();
        const center = centers.find((item) => item.id === session.centerId);
        if (!center) return;
        const branch = center.branches.find((item) => item.id === session.branchId);
        if (!branch) return;
        branch.name = $('brandBranchName').value.trim() || branch.name;
        branch.address = $('brandAddress').value.trim() || branch.address;
        branch.contact = $('brandContact').value.trim() || branch.contact;
        branch.website = $('brandWebsite').value.trim() || branch.website;
        persistCenters(centers);
        renderCenterSessionInfo();
        refreshBranding();
      }

      function addBranchFromInput() {
        const session = getActiveCenterSession();
        if (!session?.centerId) return;
        const newBranchName = ($('newBranchName')?.value || '').trim();
        if (!newBranchName) return;
        const centers = getCenters();
        const center = centers.find((item) => item.id === session.centerId);
        if (!center) return;
        const newBranch = {
          id: slugifyKey(newBranchName),
          name: newBranchName,
          address: $('brandAddress').value.trim() || 'New branch address',
          contact: $('brandContact').value.trim() || '',
          website: $('brandWebsite').value.trim() || ''
        };
        if (center.branches.some((branch) => branch.id === newBranch.id)) newBranch.id = `${newBranch.id}-${Date.now()}`;
        center.branches.push(newBranch);
        persistCenters(centers);
        persistActiveCenterSession({
          centerId: center.id,
          branchId: newBranch.id,
          userName: session.userName || 'Center User',
          role: session.role || 'consultant'
        });
        if ($('newBranchName')) $('newBranchName').value = '';
        setBrandInputsFromCenter(center, newBranch);
        refreshBranding();
        renderCenterSessionInfo();
        loadCenterSettingsIntoPanel();
        renderSavedReports();
        renderVersionHistory(null);
        renderAuditTrail(null);
        updateCurrentReportInfo(null, null);
      }
      function getActiveTabName() { return document.querySelector('.tab-btn.active')?.dataset.tab || 'nt'; }
      function getAllSerializableElements() { return Array.from(document.querySelectorAll('input[id], select[id], textarea[id]')).filter(el => !REPORT_EXCLUDED_IDS.has(el.id)); }
      function serializeWorkspaceState() { const state = {}; getAllSerializableElements().forEach(el => { state[el.id] = el.type === 'checkbox' ? el.checked : el.value; }); return state; }
      function restoreWorkspaceState(state) { Object.entries(state || {}).forEach(([id, value]) => { const el = $(id); if (!el) return; if (el.type === 'checkbox') el.checked = Boolean(value); else el.value = value; }); }
      function captureInitialTabDefaults() {
        const defaults = {};
        Object.entries(TAB_FORM_FIELD_IDS).forEach(([tab, ids]) => {
          defaults[tab] = {};
          ids.forEach((id) => {
            const el = $(id);
            if (!el) return;
            defaults[tab][id] = el.type === 'checkbox' ? !!el.checked : el.value;
          });
        });
        initialTabDefaults = defaults;
      }
      function restoreTabToDefaults(tab) {
        const defaults = initialTabDefaults?.[tab] || {};
        (TAB_FORM_FIELD_IDS[tab] || []).forEach((id) => {
          const el = $(id);
          if (!el) return;
          const value = defaults[id];
          if (el.type === 'checkbox') el.checked = !!value;
          else el.value = value ?? '';
        });
      }
      function getTabDateFieldId(tab) {
        const map = { nt: 'scanDate', level2: 'l2ScanDate', biometry: 'bScanDate', obdoppler: 'oScanDate', twins: 'tScanDate' };
        return map[tab] || 'scanDate';
      }
      function getPrimaryPatientDetailsForTab(tab = getActiveTabName()) { const mapping = { nt: { nameId: 'patientName', idId: 'patientId' }, level2: { nameId: 'l2PatientName', idId: 'l2PatientId' }, biometry: { nameId: 'bPatientName', idId: 'bPatientId' }, obdoppler: { nameId: 'oPatientName', idId: 'oPatientId' }, twins: { nameId: 'tPatientName', idId: 'tPatientId' } }; const config = mapping[tab] || mapping.nt; return { patientName: ($(config.nameId)?.value || '').trim() || 'Unnamed Patient', patientId: ($(config.idId)?.value || '').trim() || 'No ID' }; }
      function getSuggestedReportTitle(tab, patient) { const names = { nt: 'NT Scan', level2: 'Level II Scan', biometry: 'Routine Biometry', obdoppler: 'Obstetric + Doppler', twins: 'Twins' }; return `${patient.patientName} - ${names[tab] || 'Report'}`; }
      function getSavedReports() { try { const scopedKey = getScopedReportStorageKey(); const raw = localStorage.getItem(scopedKey); if (!raw && !getActiveCenterSession()) { const legacyRaw = localStorage.getItem(LEGACY_REPORT_STORAGE_KEY); if (legacyRaw) { localStorage.setItem(scopedKey, legacyRaw); localStorage.removeItem(LEGACY_REPORT_STORAGE_KEY); } } const parsed = JSON.parse(localStorage.getItem(scopedKey) || '[]'); return Array.isArray(parsed) ? parsed : []; } catch (_) { return []; } }
      function persistSavedReports(reports) { localStorage.setItem(getScopedReportStorageKey(), JSON.stringify(reports)); queueAutoSyncScope('report-save'); }
      function makeUniqueReportId() { return `RPT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
      function normalizeImportedReport(report) {
        const now = new Date().toISOString();
        const safeVersions = Array.isArray(report?.versions) && report.versions.length
          ? report.versions.map((version, index) => ({ version: Number(version?.version) || (index + 1), timestamp: version?.timestamp || now, status: version?.status || report?.status || 'Draft', note: version?.note || '', activeTab: version?.activeTab || report?.reportType || 'nt', state: version?.state && typeof version.state === 'object' ? version.state : {}, actorName: version?.actorName || 'Imported User', actorRole: version?.actorRole || 'Imported Role' }))
          : [{ version: 1, timestamp: now, status: report?.status || 'Draft', note: report?.latestNote || 'Imported backup', activeTab: report?.reportType || 'nt', state: {}, actorName: 'Imported User', actorRole: 'Imported Role' }];
        safeVersions.sort((a, b) => a.version - b.version);
        return { id: String(report?.id || makeUniqueReportId()), title: String(report?.title || 'Imported Report'), patientName: String(report?.patientName || 'Unnamed Patient'), patientId: String(report?.patientId || 'No ID'), reportType: String(report?.reportType || safeVersions[safeVersions.length - 1]?.activeTab || 'nt'), status: String(report?.status || safeVersions[safeVersions.length - 1]?.status || 'Draft'), createdAt: report?.createdAt || now, updatedAt: report?.updatedAt || now, latestNote: String(report?.latestNote || safeVersions[safeVersions.length - 1]?.note || ''), versions: safeVersions, auditTrail: Array.isArray(report?.auditTrail) ? report.auditTrail : [] };
      }
      function getReportAuditEntries(report) { if (!report) return []; if (Array.isArray(report.auditTrail) && report.auditTrail.length) return report.auditTrail; return (report.versions || []).map(version => ({ timestamp: version.timestamp, action: version.status === 'Final' ? 'Marked final' : (version.status === 'Amended' ? 'Saved amendment' : 'Saved draft'), details: version.note || '', actorName: version.actorName || 'Unknown user', actorRole: version.actorRole || 'Unknown role', centerName: report.centerName || 'Guest / local scope', branchName: report.branchName || 'Default' })); }
      function renderAuditTrail(report = null) { if (!report) { setHtml('auditTrailList', '<div class="version-history-item"><div class="version-history-sub">Load a saved report to view audit entries.</div></div>'); return; } const entries = [...getReportAuditEntries(report)].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); setHtml('auditTrailList', entries.map(entry => `<div class="version-history-item"><div class="version-history-item-header"><div><div class="version-history-title">${escapeHtml(entry.action)}</div><div class="version-history-sub">${escapeHtml(formatDate(entry.timestamp))} • ${escapeHtml(entry.actorName)} • ${escapeHtml(entry.actorRole)}</div></div></div><div class="version-history-sub">${escapeHtml(entry.details || 'No extra detail.')}</div><div class="version-history-sub">${escapeHtml(entry.centerName || 'Guest / local scope')} • ${escapeHtml(entry.branchName || 'Default')}</div></div>`).join('')); }
      function renderVersionHistory(report = null) {
        const host = $('versionHistoryList');
        if (!host) return;
        if (!report || !Array.isArray(report.versions) || !report.versions.length) {
          setHtml('versionHistoryList', '<div class="version-history-item"><div class="version-history-sub">Load a saved report to view version history.</div></div>');
          return;
        }
        const versions = [...report.versions].sort((a, b) => Number(b.version || 0) - Number(a.version || 0));
        setHtml('versionHistoryList', versions.map((version) => {
          const badgeTone = version.status === 'Final' ? 'badge-green' : (version.status === 'Amended' ? 'badge-amber' : 'badge-green');
          const restoreBtn = `<button class="mini-btn" data-history-action="restore-version" data-report-id="${escapeHtml(report.id)}" data-version="${escapeHtml(String(version.version || 0))}">Load this version</button>`;
          return `<div class="version-history-item"><div class="version-history-item-header"><div><div class="version-history-title">Version v${escapeHtml(String(version.version || 0))}</div><div class="version-history-sub">${escapeHtml(formatDate(version.timestamp))} • ${escapeHtml(version.actorName || 'Unknown user')} • ${escapeHtml(version.actorRole || 'Unknown role')}</div></div><div>${makeBadge(version.status || 'Draft', badgeTone)}</div></div><div class="version-history-sub">Tab: ${escapeHtml(version.activeTab || report.reportType || 'nt')}</div><div class="version-history-sub">Note: ${escapeHtml(version.note || '-')}</div><div class="version-history-actions">${restoreBtn}</div></div>`;
        }).join(''));
      }
      function syncPrintVersionMeta(report = null, versionEntry = null) { const status = report?.status || 'Unsaved Draft'; const versionText = versionEntry?.version ? `v${versionEntry.version}` : 'v0'; const note = versionEntry?.note || report?.latestNote || '-'; REPORT_PRINT_META_KEYS.forEach(keys => { setText(keys.status, status); setText(keys.version, versionText); setText(keys.note, note || '-'); }); }
      function refreshAllCalculatedViews() { refreshBranding(); calculateAll(); calculateLevel2(); calculateBiometry(); calculateObDoppler(); calculateTwins(); }
      function buildVersionEntry(status, note) { const user = getCurrentUserContext(); return { version: 0, timestamp: new Date().toISOString(), status, note: note || '', activeTab: getActiveTabName(), state: serializeWorkspaceState(), actorName: user.userName, actorRole: user.roleLabel }; }
      function updateWorkspaceLockState() {
        const report = getCurrentLoadedReport(); const user = getCurrentUserContext(); const lockEl = $('currentLockState'); if (!lockEl) return;
        if (!hasPermission('editClinical')) { lockEl.className = 'lock-banner locked'; lockEl.innerHTML = `Read-only role active for <strong>${escapeHtml(user.userName)}</strong> as <span class="role-badge-inline">${escapeHtml(user.roleLabel)}</span>. Clinical fields are locked. You may review, load, and print reports.`; return; }
        if (currentEditMode === 'amendment') { lockEl.className = 'lock-banner unlocked'; lockEl.innerHTML = 'Amendment draft mode is active. Finalized content is temporarily unlocked for amendment editing. After making changes, click <strong>Update Current</strong> to save an amended version and relock the report.'; return; }
        if (report && ['Final','Amended'].includes(report.status)) { lockEl.className = 'lock-banner locked'; lockEl.innerHTML = `This report is <strong>${escapeHtml(report.status)}</strong> and is currently final-locked. To change it, enter a mandatory amendment reason and click <strong>Create Amendment</strong>.`; return; }
        lockEl.className = 'lock-banner unlocked'; lockEl.innerHTML = `Editable workspace active for <strong>${escapeHtml(user.userName)}</strong> as <span class="role-badge-inline">${escapeHtml(user.roleLabel)}</span>. Draft edits are allowed in the current scope.`;
      }
      function applyRoleAndLockState() {
        const report = getCurrentLoadedReport();
        const lockedByFinal = !!report && ['Final','Amended'].includes(report.status) && currentEditMode !== 'amendment';
        const canEditClinical = hasPermission('editClinical') && !lockedByFinal;
        const canPrint = hasPermission('print');
        Array.from(document.querySelectorAll('.tab-panel input[id], .tab-panel select[id], .tab-panel textarea[id]')).forEach(el => { el.disabled = !canEditClinical; });
        ['ntRefreshBtn','ntDemoBtn','l2RefreshBtn','l2DemoBtn','bioRefreshBtn','bioDemoBtn','obRefreshBtn','obDemoBtn','twinsRefreshBtn','twinsDemoBtn'].forEach(id => { const el = $(id); if (el) el.disabled = !canEditClinical; });
        ['ntPrintBtn','l2PrintBtn','bioPrintBtn','obPrintBtn','twinsPrintBtn','printBtn','printWorkspaceBtn','exportActivePdfBtn'].forEach(id => { const el = $(id); if (el) el.disabled = !canPrint; });
        BRANDING_FIELD_IDS.forEach(id => { const el = $(id); if (el) el.disabled = !(hasPermission('manageCenter') || hasPermission('manageBranch')); });
        if ($('workspaceReportTitle')) $('workspaceReportTitle').disabled = !(hasPermission('editClinical') && !lockedByFinal);
        if ($('workspaceVersionNote')) $('workspaceVersionNote').disabled = !(hasPermission('editClinical') || hasPermission('amend') || hasPermission('finalize'));
        if ($('saveNewReportBtn')) $('saveNewReportBtn').disabled = !hasPermission('editClinical');
        if ($('updateReportBtn')) $('updateReportBtn').disabled = !(hasPermission('editClinical') && (!report || report.status === 'Draft' || currentEditMode === 'amendment'));
        if ($('markFinalBtn')) $('markFinalBtn').disabled = !(hasPermission('finalize') && (!report || report.status === 'Draft') && currentEditMode !== 'amendment');
        if ($('createAmendmentBtn')) $('createAmendmentBtn').disabled = !(hasPermission('amend') && !!report && ['Final','Amended'].includes(report.status) && currentEditMode !== 'amendment');
        if ($('duplicateCurrentBtn')) $('duplicateCurrentBtn').disabled = !(hasPermission('duplicate') && !!report);
        const hasFinal = !!report && report.versions?.some(version => version.status === 'Final');
        if ($('restoreLatestFinalBtn')) $('restoreLatestFinalBtn').disabled = !hasFinal;
        if ($('exportBackupBtn')) $('exportBackupBtn').disabled = !hasPermission('backup');
        if ($('importBackupBtn')) $('importBackupBtn').disabled = !hasPermission('backup');
        if ($('saveCenterProfileBtn')) $('saveCenterProfileBtn').disabled = !((hasPermission('manageCenter')) && !!getCurrentCenter());
        if ($('saveBranchProfileBtn')) $('saveBranchProfileBtn').disabled = !((hasPermission('manageBranch')) && !!getCurrentCenter());
        if ($('addBranchBtn')) $('addBranchBtn').disabled = !((hasPermission('manageBranch')) && !!getCurrentCenter());
        if ($('applyBrandingBtn')) $('applyBrandingBtn').disabled = !(hasPermission('manageCenter') || hasPermission('manageBranch'));
        updateWorkspaceLockState();
      }
      function startAmendmentMode() { const report = getCurrentLoadedReport(); if (!report || !['Final','Amended'].includes(report.status) || !hasPermission('amend')) return; const note = ($('workspaceVersionNote')?.value || '').trim(); if (!note) { const lockEl = $('currentLockState'); if (lockEl) { lockEl.className = 'lock-banner locked'; lockEl.innerHTML = 'Amendment reason is mandatory. Enter the amendment note first, then click <strong>Create Amendment</strong> again.'; } return; } currentEditMode = 'amendment'; applyRoleAndLockState(); }
      function updateCurrentReportInfo(report = null, versionEntry = null) {
        const center = getCurrentCenter(), branch = getCurrentBranch(center);
        if (!report) {
          setHtml('currentReportInfo', `Current scope: <strong>${escapeHtml(getCurrentScopeLabel())}</strong><br>Use <strong>Save New Report</strong> to create a browser-saved draft without affecting the current prototype.`);
          syncPrintVersionMeta(null, null);
          renderAuditTrail(null);
          applyRoleAndLockState();
          renderFinalizeValidationBox();
          return;
        }
        const latest = versionEntry || report.versions[report.versions.length - 1];
        setHtml('currentReportInfo', `<div><strong>Current report:</strong> ${escapeHtml(report.title)}</div><div><strong>Public serial:</strong> ${escapeHtml(getSavedReportPublicId(report))} • <strong>Monthly sequence:</strong> ${escapeHtml(report.reportSerialNumber || '-')}</div><div><strong>Patient:</strong> ${escapeHtml(report.patientName)} (${escapeHtml(report.patientId)})</div><div><strong>Scope:</strong> ${escapeHtml(report.centerName || center?.displayName || 'Guest')} / ${escapeHtml(report.branchName || branch?.name || 'Default')}</div><div><strong>Status:</strong> ${escapeHtml(report.status)} | <strong>Version:</strong> v${latest?.version || 0} | <strong>Tab:</strong> ${escapeHtml(report.reportType)}</div><div><strong>Created:</strong> ${escapeHtml(formatDate(report.createdAt))} | <strong>Updated:</strong> ${escapeHtml(formatDate(report.updatedAt))}</div><div><strong>Latest note:</strong> ${escapeHtml(latest?.note || '-')}</div>`);
        syncPrintVersionMeta(report, latest);
        renderAuditTrail(report);
        applyRoleAndLockState();
        renderFinalizeValidationBox();
        syncReceptionSelectionForReport(report);
      }
      function updateReportResultCount(reports) {
        const patientCount = new Set(reports.map(report => `${report.patientName || ''}__${report.patientId || ''}`)).size;
        setText('reportResultCount', reports.length ? `Showing ${reports.length} report(s) across ${patientCount} patient(s) in ${getCurrentScopeLabel()}.` : `Showing 0 reports in ${getCurrentScopeLabel()}.`);
      }
      function clearReportFilters() {
        if ($('reportSearch')) $('reportSearch').value = '';
        if ($('reportSearchMode')) $('reportSearchMode').value = 'all';
        if ($('reportSortOrder')) $('reportSortOrder').value = 'updated_desc';
        if ($('reportStatusFilter')) $('reportStatusFilter').value = '';
        renderSavedReports();
      }
      function sanitizeFilePart(value, fallback) {
        const raw = String(value || '').trim();
        const spaced = raw.split(' ').filter(Boolean).join('_');
        let cleaned = '';
        for (const ch of spaced) {
          if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch === '_' || ch === '-' || ch === '.') cleaned += ch;
        }
        return cleaned.slice(0, 60) || fallback;
      }
      function exportActiveReportPdf() {
        if (!hasPermission('print')) return;
        const activeTab = getActiveTabName();
        if (!ensureDraftRequirements(activeTab, 'print the report')) return;
        const tabMeta = {
          nt: { patientId: 'rPatientName', reportId: 'ntReportId', label: 'NT_Scan' },
          level2: { patientId: 'rl2PatientName', reportId: 'l2ReportId', label: 'Level_II_Scan' },
          biometry: { patientId: 'rbPatientName', reportId: 'bReportId', label: 'Routine_Biometry' },
          obdoppler: { patientId: 'roPatientName', reportId: 'oReportId', label: 'Obstetric_Doppler' },
          twins: { patientId: 'rtPatientName', reportId: 'tReportId', label: 'Twin_Report' }
        };
        const meta = tabMeta[activeTab] || tabMeta.nt;
        const patientName = sanitizeFilePart($(meta.patientId)?.textContent || 'patient', 'patient');
        const reportId = sanitizeFilePart($(meta.reportId)?.textContent || meta.label, meta.label);
        const previousTitle = document.title;
        document.title = `${patientName}_${reportId}_${meta.label}`;
        requestAnimationFrame(() => {
          window.print();
          window.setTimeout(() => { document.title = previousTitle; }, 800);
        });
      }
      function sanitizeWhatsappNumber(value) {
        return String(value || '').replace(/[^0-9]/g, '');
      }
      function getActiveReportWhatsappMeta() {
        const activeTab = getActiveTabName();
        const map = {
          nt: {
            patientName: $('rPatientName')?.textContent || '-',
            reportId: $('ntReportId')?.textContent || '-',
            reportTitle: 'NT Scan Report',
            status: $('ntPrintStatus')?.textContent || 'Unsaved Draft',
            impression: ($('rImpression')?.textContent || '').trim(),
            recommendation: ($('rRecommendation')?.textContent || '').trim()
          },
          level2: {
            patientName: $('rl2PatientName')?.textContent || '-',
            reportId: $('l2ReportId')?.textContent || '-',
            reportTitle: 'Level II Scan Report',
            status: $('l2PrintStatus')?.textContent || 'Unsaved Draft',
            impression: ($('rl2Impression')?.textContent || '').trim(),
            recommendation: ($('rl2Recommendation')?.textContent || '').trim()
          },
          biometry: {
            patientName: $('rbPatientName')?.textContent || '-',
            reportId: $('bReportId')?.textContent || '-',
            reportTitle: 'Routine Biometry Report',
            status: $('bPrintStatus')?.textContent || 'Unsaved Draft',
            impression: ($('rbImpression')?.textContent || '').trim(),
            recommendation: ($('rbRecommendation')?.textContent || '').trim()
          },
          obdoppler: {
            patientName: $('roPatientName')?.textContent || '-',
            reportId: $('oReportId')?.textContent || '-',
            reportTitle: 'Obstetric + Doppler Report',
            status: $('oPrintStatus')?.textContent || 'Unsaved Draft',
            impression: ($('roImpression')?.textContent || '').trim(),
            recommendation: ($('roRecommendation')?.textContent || '').trim()
          },
          twins: {
            patientName: $('rtPatientName')?.textContent || '-',
            reportId: $('tReportId')?.textContent || '-',
            reportTitle: 'Twin Pregnancy Report',
            status: $('tPrintStatus')?.textContent || 'Unsaved Draft',
            impression: ($('rtImpression')?.textContent || '').trim(),
            recommendation: ($('rtRecommendation')?.textContent || '').trim()
          }
        };
        return map[activeTab] || map.nt;
      }
      function buildWhatsappShareText() {
        const meta = getActiveReportWhatsappMeta();
        const mode = $('whatsappMode')?.value || 'summary';
        const clinic = $('brandClinicName')?.value?.trim() || 'Fetal Medicine & Ultrasound Centre';
        const branch = $('brandBranchName')?.value?.trim() || 'Main Branch';
        const consultant = $('brandConsultant')?.value?.trim() || 'Dr Consultant Name, MD Radiodiagnosis';
        const status = meta.status || 'Unsaved Draft';
        const lines = [];
        lines.push(`Digital copy from ${clinic}`);
        lines.push(`Branch: ${branch}`);
        lines.push(`Patient: ${meta.patientName}`);
        lines.push(`Report: ${meta.reportTitle}`);
        lines.push(`Report ID: ${meta.reportId}`);
        lines.push(`Status: ${status}`);
        if (mode === 'detailed') {
          if (meta.impression) lines.push(`Impression: ${meta.impression}`);
          if (meta.recommendation) lines.push(`Recommendation: ${meta.recommendation}`);
        } else {
          if (meta.recommendation) lines.push(`Recommendation: ${meta.recommendation}`);
        }
        lines.push(`Consultant: ${consultant}`);
        lines.push('Signed PDF generated from clinic workflow with embedded signature / stamp where enabled.');
        return lines.filter(Boolean).join(String.fromCharCode(10));
      }
      function updateWhatsappPreview() {
        setText('whatsappPreviewBox', buildWhatsappShareText());
      }
      function copyWhatsappText() {
        const text = buildWhatsappShareText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            setText('whatsappPreviewBox', text + String.fromCharCode(10, 10) + '[Copied to clipboard]');
          }).catch(() => {
            setText('whatsappPreviewBox', text);
          });
          return;
        }
        setText('whatsappPreviewBox', text);
      }
      function getActivePrintableConfig() {
        const activeTab = getActiveTabName();
        const map = {
          nt: { printableId: 'printable-nt', patientId: 'rPatientName', reportId: 'ntReportId', label: 'NT_Scan_Report' },
          level2: { printableId: 'printable-level2', patientId: 'rl2PatientName', reportId: 'l2ReportId', label: 'Level_II_Scan_Report' },
          biometry: { printableId: 'printable-biometry', patientId: 'rbPatientName', reportId: 'bReportId', label: 'Routine_Biometry_Report' },
          obdoppler: { printableId: 'printable-obdoppler', patientId: 'roPatientName', reportId: 'oReportId', label: 'Obstetric_Doppler_Report' },
          twins: { printableId: 'printable-twins', patientId: 'rtPatientName', reportId: 'tReportId', label: 'Twin_Pregnancy_Report' }
        };
        return map[activeTab] || map.nt;
      }
      function downloadBlobFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(url), 1200);
      }
      async function generateActiveSignedPdfBundle() {
        const config = getActivePrintableConfig();
        const shell = document.querySelector(`#${config.printableId} .report-shell`) || $(config.printableId);
        if (!shell) throw new Error('Printable report shell not found');
        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) throw new Error('PDF libraries not loaded');
        const patientName = sanitizeFilePart($(config.patientId)?.textContent || 'patient', 'patient');
        const reportId = sanitizeFilePart($(config.reportId)?.textContent || config.label, config.label);
        const filename = `${patientName}_${reportId}.pdf`;
        const canvas = await window.html2canvas(shell, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: Math.max(shell.scrollWidth, shell.offsetWidth, 900),
          windowHeight: Math.max(shell.scrollHeight, shell.offsetHeight, 1200),
          scrollX: 0,
          scrollY: -window.scrollY
        });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
        }
        const blob = pdf.output('blob');
        const caption = buildWhatsappShareText();
        return { blob, filename, caption };
      }
      async function downloadSignedPdf() {
        if (!hasPermission('print')) return;
        setText('whatsappPreviewBox', 'Preparing signed PDF download...');
        try {
          const bundle = await generateActiveSignedPdfBundle();
          downloadBlobFile(bundle.blob, bundle.filename);
          const spacer = String.fromCharCode(10, 10);
          const doneText = bundle.caption + spacer + '[Signed PDF downloaded: ' + bundle.filename + ']';
          setText('whatsappPreviewBox', doneText);
        } catch (err) {
          setText('whatsappPreviewBox', 'PDF generation failed: ' + err.message);
        }
      }
      async function openWhatsAppShare() {
        if (!hasPermission('print')) return;
        setText('whatsappPreviewBox', 'Preparing signed PDF for WhatsApp share...');
        try {
          const bundle = await generateActiveSignedPdfBundle();
          const file = new File([bundle.blob], bundle.filename, { type: 'application/pdf' });
          const shareData = { title: bundle.filename, text: bundle.caption, files: [file] };
          const spacer = String.fromCharCode(10, 10);
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share(shareData);
            const sharedText = bundle.caption + spacer + '[Signed PDF shared. Choose WhatsApp in the device share sheet if available.]';
            setText('whatsappPreviewBox', sharedText);
            return;
          }
          downloadBlobFile(bundle.blob, bundle.filename);
          const phone = sanitizeWhatsappNumber($('whatsappNumber')?.value || '');
          const fallbackText = bundle.caption + spacer + 'Signed PDF downloaded as ' + bundle.filename + '. Attach this PDF in WhatsApp and send.';
          const base = phone ? ('https://wa.me/' + phone) : 'https://wa.me/';
          window.open(base + '?text=' + encodeURIComponent(fallbackText), '_blank', 'noopener');
          const helperText = fallbackText + spacer + '[Native file sharing is not supported in this browser. The signed PDF has been downloaded and WhatsApp caption opened for manual attachment.]';
          setText('whatsappPreviewBox', helperText);
        } catch (err) {
          setText('whatsappPreviewBox', 'WhatsApp signed PDF share failed: ' + err.message);
        }
      }
      function normalizePatientMasterKey(patientName, patientId) {
        const idKey = String(patientId || '').trim().toLowerCase();
        const nameKey = String(patientName || '').trim().toLowerCase().split(' ').filter(Boolean).join(' ');
        return idKey ? `id:${idKey}` : `name:${nameKey}`;
      }
      function getPatientFieldMapByTab(tab = getActiveTabName()) {
        const maps = {
          nt: { nameId: 'patientName', idId: 'patientId', ageId: 'maternalAge' },
          level2: { nameId: 'l2PatientName', idId: 'l2PatientId', ageId: 'l2MaternalAge' },
          biometry: { nameId: 'bPatientName', idId: 'bPatientId', ageId: 'bMaternalAge' },
          obdoppler: { nameId: 'oPatientName', idId: 'oPatientId', ageId: 'oMaternalAge' },
          twins: { nameId: 'tPatientName', idId: 'tPatientId', ageId: 'tMaternalAge' }
        };
        return maps[tab] || maps.nt;
      }
      function getVisitMetaFieldMap(reportType = 'nt') {
        const maps = {
          nt: { scanDate: 'scanDate', age: 'maternalAge', doctor: 'referringDoctor', indication: 'indication' },
          level2: { scanDate: 'l2ScanDate', age: 'l2MaternalAge', doctor: 'l2ReferringDoctor', indication: 'l2Indication' },
          biometry: { scanDate: 'bScanDate', age: 'bMaternalAge', doctor: 'bReferringDoctor', indication: 'bIndication' },
          obdoppler: { scanDate: 'oScanDate', age: 'oMaternalAge', doctor: 'oReferringDoctor', indication: 'oIndication' },
          twins: { scanDate: 'tScanDate', age: 'tMaternalAge', doctor: 'tReferringDoctor', indication: 'tIndication' }
        };
        return maps[reportType] || maps.nt;
      }
      function getContextSnapshotFromState(reportType, state = {}) {
        if (reportType === 'nt') return { age: state.maternalAge || '', doctor: state.referringDoctor || '', indication: state.indication || '', placenta: state.placenta || '', liquor: state.liquor || '' };
        if (reportType === 'level2') return { age: state.l2MaternalAge || '', doctor: state.l2ReferringDoctor || '', indication: state.l2Indication || '', gaWeeks: state.l2GaWeeks || '', gaDays: state.l2GaDays || '', placenta: state.l2Placenta || '', liquor: state.l2Liquor || '', cervix: state.l2Cervix || '' };
        if (reportType === 'biometry') return { age: state.bMaternalAge || '', doctor: state.bReferringDoctor || '', indication: state.bIndication || '', gaWeeks: state.bGaWeeks || '', gaDays: state.bGaDays || '', placenta: state.bPlacenta || '', liquor: state.bLiquor || '', presentation: state.bPresentation || '' };
        if (reportType === 'obdoppler') return { age: state.oMaternalAge || '', doctor: state.oReferringDoctor || '', indication: state.oIndication || '', gaWeeks: state.oGaWeeks || '', gaDays: state.oGaDays || '', placenta: state.oPlacenta || '', liquor: state.oLiquor || '', presentation: state.oPresentation || '' };
        if (reportType === 'twins') return { age: state.tMaternalAge || '', doctor: state.tReferringDoctor || '', indication: state.tIndication || '', gaWeeks: state.tGaWeeks || '', gaDays: state.tGaDays || '', chorionicity: state.tChorionicity || '', placenta: state.tPlacenta || '', aPresentation: state.tAPresentation || '', bPresentation: state.tBPresentation || '' };
        return {};
      }
      function applyContextSnapshotToTarget(targetTab, snapshot = {}) {
        if (targetTab === 'nt') {
          if ($('maternalAge') && snapshot.age) $('maternalAge').value = snapshot.age;
          if ($('referringDoctor') && snapshot.doctor) $('referringDoctor').value = snapshot.doctor;
          if ($('indication') && snapshot.indication) $('indication').value = snapshot.indication;
          if ($('placenta') && snapshot.placenta) $('placenta').value = snapshot.placenta;
          if ($('liquor') && snapshot.liquor) $('liquor').value = snapshot.liquor;
          return;
        }
        if (targetTab === 'level2') {
          if ($('l2MaternalAge') && snapshot.age) $('l2MaternalAge').value = snapshot.age;
          if ($('l2ReferringDoctor') && snapshot.doctor) $('l2ReferringDoctor').value = snapshot.doctor;
          if ($('l2Indication') && snapshot.indication) $('l2Indication').value = snapshot.indication;
          if ($('l2GaWeeks') && snapshot.gaWeeks) $('l2GaWeeks').value = snapshot.gaWeeks;
          if ($('l2GaDays') && snapshot.gaDays) $('l2GaDays').value = snapshot.gaDays;
          if ($('l2Placenta') && snapshot.placenta) $('l2Placenta').value = snapshot.placenta;
          if ($('l2Liquor') && snapshot.liquor) $('l2Liquor').value = snapshot.liquor;
          if ($('l2Cervix') && snapshot.cervix) $('l2Cervix').value = snapshot.cervix;
          return;
        }
        if (targetTab === 'biometry') {
          if ($('bMaternalAge') && snapshot.age) $('bMaternalAge').value = snapshot.age;
          if ($('bReferringDoctor') && snapshot.doctor) $('bReferringDoctor').value = snapshot.doctor;
          if ($('bIndication') && snapshot.indication) $('bIndication').value = snapshot.indication;
          if ($('bGaWeeks') && snapshot.gaWeeks) $('bGaWeeks').value = snapshot.gaWeeks;
          if ($('bGaDays') && snapshot.gaDays) $('bGaDays').value = snapshot.gaDays;
          if ($('bPlacenta') && snapshot.placenta) $('bPlacenta').value = snapshot.placenta;
          if ($('bLiquor') && snapshot.liquor) $('bLiquor').value = snapshot.liquor;
          if ($('bPresentation') && snapshot.presentation) $('bPresentation').value = snapshot.presentation;
          return;
        }
        if (targetTab === 'obdoppler') {
          if ($('oMaternalAge') && snapshot.age) $('oMaternalAge').value = snapshot.age;
          if ($('oReferringDoctor') && snapshot.doctor) $('oReferringDoctor').value = snapshot.doctor;
          if ($('oIndication') && snapshot.indication) $('oIndication').value = snapshot.indication;
          if ($('oGaWeeks') && snapshot.gaWeeks) $('oGaWeeks').value = snapshot.gaWeeks;
          if ($('oGaDays') && snapshot.gaDays) $('oGaDays').value = snapshot.gaDays;
          if ($('oPlacenta') && snapshot.placenta) $('oPlacenta').value = snapshot.placenta;
          if ($('oLiquor') && snapshot.liquor) $('oLiquor').value = snapshot.liquor;
          if ($('oPresentation') && snapshot.presentation) $('oPresentation').value = snapshot.presentation;
          return;
        }
        if (targetTab === 'twins') {
          if ($('tMaternalAge') && snapshot.age) $('tMaternalAge').value = snapshot.age;
          if ($('tReferringDoctor') && snapshot.doctor) $('tReferringDoctor').value = snapshot.doctor;
          if ($('tIndication') && snapshot.indication) $('tIndication').value = snapshot.indication;
          if ($('tGaWeeks') && snapshot.gaWeeks) $('tGaWeeks').value = snapshot.gaWeeks;
          if ($('tGaDays') && snapshot.gaDays) $('tGaDays').value = snapshot.gaDays;
          if ($('tChorionicity') && snapshot.chorionicity) $('tChorionicity').value = snapshot.chorionicity;
          if ($('tPlacenta') && snapshot.placenta) $('tPlacenta').value = snapshot.placenta;
          if ($('tAPresentation') && snapshot.aPresentation) $('tAPresentation').value = snapshot.aPresentation;
          if ($('tBPresentation') && snapshot.bPresentation) $('tBPresentation').value = snapshot.bPresentation;
        }
      }
      function getLatestPatientVisitState(selected, preferredTab = '') {
        if (!selected) return null;
        const preferredVisit = preferredTab ? selected.reports.find((visit) => visit.reportType === preferredTab) : null;
        const candidate = preferredVisit || selected.reports[0] || null;
        if (!candidate) return null;
        const report = getSavedReports().find((item) => item.id === candidate.reportId);
        if (!report) return null;
        const latestVersion = report.versions?.[report.versions.length - 1] || null;
        return latestVersion ? { report, version: latestVersion, state: latestVersion.state || {}, reportType: latestVersion.activeTab || report.reportType || candidate.reportType } : null;
      }
      function createVisitFromPatientMasterSelection() {
        const selected = getSelectedPatientMaster();
        if (!selected) return;
        const targetTab = $('newVisitTargetTab')?.value || getActiveTabName();
        const carryMode = $('newVisitCarryMode')?.value || 'patient_context';
        const targetFields = getPatientFieldMapByTab(targetTab);
        const sameTabBundle = getLatestPatientVisitState(selected, targetTab);
        const latestBundle = getLatestPatientVisitState(selected);
        currentLoadedReportId = null;
        currentEditMode = 'normal';
        switchTab(targetTab);
        restoreTabToDefaults(targetTab);
        if (carryMode === 'same_tab_full' && sameTabBundle?.state) {
          (TAB_FORM_FIELD_IDS[targetTab] || []).forEach((id) => {
            const el = $(id);
            if (!el) return;
            if (!(id in sameTabBundle.state)) return;
            if (el.type === 'checkbox') el.checked = !!sameTabBundle.state[id];
            else el.value = sameTabBundle.state[id];
          });
        }
        if ($(targetFields.nameId)) $(targetFields.nameId).value = selected.patientName || '';
        if ($(targetFields.idId)) $(targetFields.idId).value = selected.patientId || '';
        if ($(targetFields.ageId) && selected.latestAge) $(targetFields.ageId).value = selected.latestAge;
        if (carryMode !== 'patient_only') {
          const contextBundle = (carryMode === 'same_tab_full' && sameTabBundle) ? sameTabBundle : latestBundle;
          if (contextBundle?.state) {
            const snapshot = getContextSnapshotFromState(contextBundle.reportType, contextBundle.state);
            applyContextSnapshotToTarget(targetTab, snapshot);
          }
        }
        const dateFieldId = getTabDateFieldId(targetTab);
        if ($(dateFieldId)) $(dateFieldId).value = new Date().toISOString().split('T')[0];
        if ($('workspaceReportTitle')) $('workspaceReportTitle').value = getSuggestedReportTitle(targetTab, { patientName: selected.patientName || 'Unnamed Patient', patientId: selected.patientId || 'No ID' });
        if ($('workspaceVersionNote')) $('workspaceVersionNote').value = 'New visit created from patient master';
        const recalcMap = { nt: calculateAll, level2: calculateLevel2, biometry: calculateBiometry, obdoppler: calculateObDoppler, twins: calculateTwins };
        (recalcMap[targetTab] || calculateAll)();
        updateWhatsappPreview();
        renderVersionHistory(null);
        renderAuditTrail(null);
        updateCurrentReportInfo(null, null);
        const helper = $('visitCreateHelper');
        if (helper) helper.textContent = carryMode === 'same_tab_full' && !sameTabBundle ? 'No previous visit exists on the selected tab, so the new visit was created using patient + latest available context.' : 'Fresh unsaved visit created from the selected patient master record. Review carried-forward fields, update current findings, and save when ready.';
      }
      function extractVisitMetaFromVersion(report, versionEntry = null) {
        const version = versionEntry || report?.versions?.[report.versions.length - 1] || {};
        const reportType = version.activeTab || report?.reportType || 'nt';
        const state = version.state || {};
        const fieldMap = getVisitMetaFieldMap(reportType);
        return {
          reportType,
          scanDate: state[fieldMap.scanDate] || '',
          age: state[fieldMap.age] || '',
          doctor: state[fieldMap.doctor] || '',
          indication: state[fieldMap.indication] || '',
          note: version.note || '',
          timestamp: version.timestamp || report?.updatedAt || ''
        };
      }
      function parseIsoDate(value) {
        if (!value) return null;
        const parts = String(value).split('-').map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
        const [year, month, day] = parts;
        return new Date(Date.UTC(year, month - 1, day));
      }
      function addDaysToIsoDate(value, days) {
        const date = parseIsoDate(value);
        if (!date || days == null || Number.isNaN(days)) return '';
        const copy = new Date(date.getTime());
        copy.setUTCDate(copy.getUTCDate() + Math.round(days));
        return copy.toISOString().slice(0, 10);
      }
      function diffIsoDays(laterValue, earlierValue) {
        const later = parseIsoDate(laterValue);
        const earlier = parseIsoDate(earlierValue);
        if (!later || !earlier) return null;
        return Math.round((later.getTime() - earlier.getTime()) / 86400000);
      }
      function getNumberFromState(state, id) {
        const raw = Number(state?.[id] || 0);
        return Number.isFinite(raw) ? raw : 0;
      }
      function computeBiometryGaDaysFromState(reportType, state = {}) {
        if (reportType === 'nt') {
          const crl = getNumberFromState(state, 'crl');
          return gaByCrl(crl).days;
        }
        if (reportType === 'level2' || reportType === 'biometry' || reportType === 'obdoppler') {
          const prefix = reportType === 'level2' ? 'l2' : (reportType === 'biometry' ? 'b' : 'o');
          const measures = [
            gaFromMm(getNumberFromState(state, `${prefix}Bpd`), 1.05, 92),
            gaFromMm(getNumberFromState(state, `${prefix}Hc`), 0.28, 92),
            gaFromMm(getNumberFromState(state, `${prefix}Ac`), 0.33, 92),
            gaFromMm(getNumberFromState(state, `${prefix}Fl`), 1.0, 109)
          ].filter(v => v != null);
          return measures.length ? Math.round(measures.reduce((a, b) => a + b, 0) / measures.length) : null;
        }
        if (reportType === 'twins') {
          const twinAGa = [
            gaFromMm(getNumberFromState(state, 'tABpd'), 1.05, 92),
            gaFromMm(getNumberFromState(state, 'tAHc'), 0.28, 92),
            gaFromMm(getNumberFromState(state, 'tAAc'), 0.33, 92),
            gaFromMm(getNumberFromState(state, 'tAFl'), 1.0, 109)
          ].filter(v => v != null);
          const twinBGa = [
            gaFromMm(getNumberFromState(state, 'tBBpd'), 1.05, 92),
            gaFromMm(getNumberFromState(state, 'tBHc'), 0.28, 92),
            gaFromMm(getNumberFromState(state, 'tBAc'), 0.33, 92),
            gaFromMm(getNumberFromState(state, 'tBFl'), 1.0, 109)
          ].filter(v => v != null);
          const all = [...twinAGa, ...twinBGa];
          return all.length ? Math.round(all.reduce((a, b) => a + b, 0) / all.length) : null;
        }
        return null;
      }
      function computeGaDatesDaysFromState(reportType, state = {}) {
        if (reportType === 'nt') {
          const scanDate = state.scanDate || '';
          const lmp = state.lmp || '';
          const diff = diffIsoDays(scanDate, lmp);
          return diff != null && diff >= 0 ? diff : null;
        }
        const prefix = reportType === 'level2' ? 'l2' : (reportType === 'biometry' ? 'b' : (reportType === 'obdoppler' ? 'o' : (reportType === 'twins' ? 't' : '')));
        if (!prefix) return null;
        const weeks = getNumberFromState(state, `${prefix}GaWeeks`);
        const days = getNumberFromState(state, `${prefix}GaDays`);
        return (weeks || days) ? Math.round((weeks * 7) + days) : null;
      }
      function getScanDateFromState(reportType, state = {}) {
        const map = { nt: 'scanDate', level2: 'l2ScanDate', biometry: 'bScanDate', obdoppler: 'oScanDate', twins: 'tScanDate' };
        return state[map[reportType] || 'scanDate'] || '';
      }
      function extractLongitudinalMeta(report, versionEntry = null) {
        const version = versionEntry || report?.versions?.[report.versions.length - 1] || {};
        const reportType = version.activeTab || report?.reportType || 'nt';
        const state = version.state || {};
        const scanDate = getScanDateFromState(reportType, state) || report?.updatedAt?.slice?.(0, 10) || '';
        const gaDatesDays = computeGaDatesDaysFromState(reportType, state);
        const gaBiometryDays = computeBiometryGaDaysFromState(reportType, state);
        const eddByDates = scanDate && gaDatesDays != null ? addDaysToIsoDate(scanDate, 280 - gaDatesDays) : '';
        const eddByBiometry = scanDate && gaBiometryDays != null ? addDaysToIsoDate(scanDate, 280 - gaBiometryDays) : '';
        let primaryEdd = '', primarySource = '-';
        if (reportType === 'nt' && state.lmp) {
          primaryEdd = addDaysToIsoDate(state.lmp, 280);
          primarySource = primaryEdd ? 'LMP' : '-';
        }
        if (!primaryEdd && eddByDates) { primaryEdd = eddByDates; primarySource = 'Dates'; }
        if (!primaryEdd && eddByBiometry) { primaryEdd = eddByBiometry; primarySource = reportType === 'nt' ? 'CRL' : 'Biometry'; }
        return {
          reportId: report?.id || '',
          title: report?.title || 'Untitled visit',
          reportType,
          status: report?.status || version?.status || 'Draft',
          updatedAt: report?.updatedAt || version?.timestamp || '',
          version: version?.version || 0,
          scanDate,
          gaDatesDays,
          gaDatesText: daysToText(gaDatesDays),
          gaBiometryDays,
          gaBiometryText: daysToText(gaBiometryDays),
          eddByDates,
          eddByBiometry,
          primaryEdd,
          primarySource,
          lmp: state.lmp || '',
          note: version?.note || report?.latestNote || ''
        };
      }
      function buildPatientLongitudinalBundle(selected) {
        if (!selected) return null;
        const items = selected.reports.map((visit) => {
          const report = getSavedReports().find((item) => item.id === visit.reportId);
          if (!report) return null;
          const latestVersion = report.versions?.[report.versions.length - 1] || null;
          return extractLongitudinalMeta(report, latestVersion);
        }).filter(Boolean).sort((a, b) => getReportVisitSortValue(b) - getReportVisitSortValue(a));
        if (!items.length) return { items: [], summary: null };
        const eddValues = items.map(item => ({ item, epoch: parseIsoDate(item.primaryEdd)?.getTime?.() || null })).filter(entry => entry.epoch != null);
        const spreadDays = eddValues.length > 1 ? Math.round((Math.max(...eddValues.map(v => v.epoch)) - Math.min(...eddValues.map(v => v.epoch))) / 86400000) : 0;
        let consistency = { label: 'Single baseline', tone: 'badge-amber', helper: 'Only one saved dated visit is currently available for longitudinal comparison.' };
        if (eddValues.length >= 2) {
          if (spreadDays <= 7) consistency = { label: 'Consistent', tone: 'badge-green', helper: 'EDD estimates across visits stay within a narrow range.' };
          else if (spreadDays <= 14) consistency = { label: 'Mild variation', tone: 'badge-amber', helper: 'EDD estimates vary moderately across visits and should be clinically correlated.' };
          else consistency = { label: 'Significant variation', tone: 'badge-red', helper: 'EDD estimates vary widely across visits; verify dating baseline and scan chronology.' };
        }
        const ascItems = [...items].sort((a, b) => getReportVisitSortValue(a) - getReportVisitSortValue(b));
        const progressionDrifts = [];
        for (let i = 1; i < ascItems.length; i += 1) {
          const prev = ascItems[i - 1];
          const curr = ascItems[i];
          const scanDelta = diffIsoDays(curr.scanDate, prev.scanDate);
          if (scanDelta == null) continue;
          const prevGa = prev.gaDatesDays ?? prev.gaBiometryDays;
          const currGa = curr.gaDatesDays ?? curr.gaBiometryDays;
          if (prevGa == null || currGa == null) continue;
          progressionDrifts.push(Math.abs((currGa - prevGa) - scanDelta));
        }
        const maxDriftDays = progressionDrifts.length ? Math.max(...progressionDrifts) : 0;
        const latest = items[0];
        return {
          items,
          summary: {
            referenceEdd: latest.primaryEdd || latest.eddByDates || latest.eddByBiometry || '',
            eddSpreadDays: spreadDays,
            maxGaDriftDays: maxDriftDays,
            datedVisits: items.filter(item => item.scanDate).length,
            consistency,
            latestGaText: latest.gaDatesText !== '-' ? latest.gaDatesText : latest.gaBiometryText,
            latestSource: latest.primarySource || '-',
            helper: consistency.helper
          }
        };
      }
      function renderPatientLongitudinalSummary() {
        const selected = getSelectedPatientMaster();
        const longitudinal = buildPatientLongitudinalBundle(selected);
        if (!selected || !longitudinal?.summary) {
          setHtml('patientLongitudinalSummary', 'Select a patient to review longitudinal EDD and GA continuity across saved visits.');
          return;
        }
        const summary = longitudinal.summary;
        const chips = [
          '<div class="longitudinal-chip"><strong>Reference EDD</strong>' + escapeHtml(formatDate(summary.referenceEdd)) + '</div>',
          '<div class="longitudinal-chip"><strong>Longitudinal continuity</strong>' + makeBadge(summary.consistency.label, summary.consistency.tone) + '</div>',
          '<div class="longitudinal-chip"><strong>EDD spread</strong>' + escapeHtml(String(summary.eddSpreadDays)) + ' day(s)</div>',
          '<div class="longitudinal-chip"><strong>Max GA progression drift</strong>' + escapeHtml(String(summary.maxGaDriftDays)) + ' day(s)</div>',
          '<div class="longitudinal-chip"><strong>Dated visits</strong>' + escapeHtml(String(summary.datedVisits)) + '</div>',
          '<div class="longitudinal-chip"><strong>Latest GA baseline</strong>' + escapeHtml(summary.latestGaText || '-') + ' (' + escapeHtml(summary.latestSource || '-') + ')</div>'
        ].join('');
        setHtml('patientLongitudinalSummary', '<div><strong>Patient longitudinal dating continuity</strong> across the current branch scope.</div><div class="longitudinal-summary-grid">' + chips + '</div><div class="longitudinal-helper">' + escapeHtml(summary.helper) + '</div>');
      }
      function renderPatientLongitudinalTimeline() {
        const selected = getSelectedPatientMaster();
        const longitudinal = buildPatientLongitudinalBundle(selected);
        if (!selected || !longitudinal?.items?.length) {
          setHtml('patientLongitudinalTimeline', '<div class="version-history-item"><div class="version-history-sub">No longitudinal visit data available.</div></div>');
          return;
        }
        const latestEdd = longitudinal.summary?.referenceEdd || '';
        const html = longitudinal.items.map((item) => {
          const eddDrift = latestEdd && item.primaryEdd ? diffIsoDays(item.primaryEdd, latestEdd) : null;
          const chips = [
            '<span class="timeline-chip">' + escapeHtml(item.reportType) + '</span>',
            '<span class="timeline-chip">Scan: ' + escapeHtml(formatDate(item.scanDate || item.updatedAt)) + '</span>',
            '<span class="timeline-chip">GA dates: ' + escapeHtml(item.gaDatesText || '-') + '</span>',
            '<span class="timeline-chip">GA scan: ' + escapeHtml(item.gaBiometryText || '-') + '</span>'
          ].join('');
          const driftText = eddDrift == null ? 'EDD drift: -' : ('EDD drift vs latest baseline: ' + String(eddDrift) + ' day(s)');
          return '<div class="version-history-item">'
            + '<div class="version-history-item-header"><div><div class="version-history-title">' + escapeHtml(item.title) + '</div><div class="version-history-sub">EDD source: ' + escapeHtml(item.primarySource || '-') + ' • Primary EDD: ' + escapeHtml(formatDate(item.primaryEdd || item.eddByDates || item.eddByBiometry)) + '</div></div><div>' + makeBadge(item.status || 'Draft', item.status === 'Final' ? 'badge-green' : (item.status === 'Amended' ? 'badge-amber' : 'badge-green')) + '</div></div>'
            + '<div class="patient-master-meta">' + chips + '</div>'
            + '<div class="version-history-sub" style="margin-top:8px;">EDD by dates: ' + escapeHtml(formatDate(item.eddByDates)) + ' • EDD by scan: ' + escapeHtml(formatDate(item.eddByBiometry)) + '</div>'
            + '<div class="version-history-sub">' + escapeHtml(driftText) + '</div>'
            + '</div>';
        }).join('');
        setHtml('patientLongitudinalTimeline', html);
      }
      function getReportVisitSortValue(visit) {
        return new Date(visit.scanDate || visit.updatedAt || 0).getTime() || 0;
      }
      function percentileTextToSerialValue(text) {
        const map = { '<1st': 1, '3rd': 3, '10th': 10, '25th': 25, '50th': 50, '75th': 75, '90th': 90, '97th': 97, '>99th': 99, '≤50th': 50, '50th-95th': 75, '95th-99th': 97, '-': null };
        return Object.prototype.hasOwnProperty.call(map, text) ? map[text] : null;
      }
      function computeAutoEfw(bpd, ac, fl) {
        if (!(bpd || ac || fl)) return null;
        return Math.max(100, Math.round((Number(bpd || 0) * 2.2) + (Number(ac || 0) * 1.1) + (Number(fl || 0) * 4.5) - 30));
      }
      function getSnapshotGaWeek(longitudinalMeta) {
        const gaDays = longitudinalMeta?.gaDatesDays ?? longitudinalMeta?.gaBiometryDays;
        return gaDays != null ? (gaDays / 7) : null;
      }
      function getVisitBundleByReportId(reportId) {
        const report = getSavedReports().find((item) => item.id === reportId);
        if (!report) return null;
        const latestVersion = report.versions?.[report.versions.length - 1] || null;
        return latestVersion ? { report, version: latestVersion, state: latestVersion.state || {}, reportType: latestVersion.activeTab || report.reportType || 'nt' } : null;
      }
      function formatVisitCompareOption(visit) {
        const dateText = formatDate(visit.scanDate || visit.updatedAt);
        return `${visit.title || 'Untitled visit'} • ${visit.reportType} • ${dateText}`;
      }
      function extractSerialTrendSnapshot(reportId) {
        const bundle = getVisitBundleByReportId(reportId);
        if (!bundle) return null;
        const { report, state, reportType, version } = bundle;
        const longitudinal = extractLongitudinalMeta(report, version);
        const gaWeek = getSnapshotGaWeek(longitudinal);
        const snapshot = {
          reportId: report.id,
          title: report.title || 'Untitled visit',
          reportType,
          scanDate: longitudinal.scanDate || '',
          updatedAt: report.updatedAt || version.timestamp || '',
          gaText: longitudinal.gaDatesText !== '-' ? longitudinal.gaDatesText : longitudinal.gaBiometryText,
          primaryEdd: longitudinal.primaryEdd || '',
          efw: null,
          acPct: null,
          efwPct: null,
          mcaPi: null,
          uaPi: null,
          cpr: null
        };
        if (reportType === 'level2' || reportType === 'biometry' || reportType === 'obdoppler') {
          const prefix = reportType === 'level2' ? 'l2' : (reportType === 'biometry' ? 'b' : 'o');
          const ac = Number(state[`${prefix}Ac`] || 0);
          const efwRaw = Number(state[`${prefix}Efw`] || 0);
          const efw = efwRaw || computeAutoEfw(state[`${prefix}Bpd`], ac, state[`${prefix}Fl`]);
          const acPctText = gaWeek ? tablePercentile(ac, gaWeek, 'ac') : '-';
          const efwPctText = gaWeek ? tablePercentile(efw, gaWeek, 'efw') : '-';
          snapshot.efw = efw || null;
          snapshot.acPct = percentileTextToSerialValue(acPctText);
          snapshot.efwPct = percentileTextToSerialValue(efwPctText);
          if (reportType === 'level2') {
            snapshot.mcaPi = Number(state.l2McaPi || 0) || null;
            snapshot.uaPi = Number(state.l2UaPi || 0) || null;
            snapshot.cpr = snapshot.mcaPi && snapshot.uaPi ? (snapshot.mcaPi / snapshot.uaPi) : null;
          }
          if (reportType === 'obdoppler') {
            snapshot.mcaPi = Number(state.oMcaPi || 0) || null;
            snapshot.uaPi = Number(state.oUaPi || 0) || null;
            snapshot.cpr = snapshot.mcaPi && snapshot.uaPi ? (snapshot.mcaPi / snapshot.uaPi) : null;
          }
          return snapshot;
        }
        if (reportType === 'twins') {
          const aEfw = Number(state.tAEfw || 0) || computeAutoEfw(state.tABpd, state.tAAc, state.tAFl);
          const bEfw = Number(state.tBEfw || 0) || computeAutoEfw(state.tBBpd, state.tBAc, state.tBFl);
          snapshot.efw = (aEfw && bEfw) ? Math.round((aEfw + bEfw) / 2) : (aEfw || bEfw || null);
          return snapshot;
        }
        return snapshot;
      }
      function renderPatientSerialTrendCharts() {
        const selected = getSelectedPatientMaster();
        const summaryEl = $('patientSerialTrendSummary');
        if (!patientGrowthTrendChart || !patientDopplerTrendChart || !summaryEl) return;
        if (!selected) {
          setHtml('patientSerialTrendSummary', 'Select a patient to plot serial EFW, percentile, and Doppler trends across saved visits.');
          patientGrowthTrendChart.data.labels = [];
          patientGrowthTrendChart.data.datasets.forEach(dataset => { dataset.data = []; });
          patientGrowthTrendChart.update();
          patientDopplerTrendChart.data.labels = [];
          patientDopplerTrendChart.data.datasets.forEach(dataset => { dataset.data = []; });
          patientDopplerTrendChart.update();
          return;
        }
        const items = selected.reports.map((visit) => extractSerialTrendSnapshot(visit.reportId)).filter(Boolean).sort((a, b) => getReportVisitSortValue(a) - getReportVisitSortValue(b));
        if (!items.length) {
          setHtml('patientSerialTrendSummary', 'No serial saved-visit data is available for growth / Doppler plotting in the current branch scope.');
          patientGrowthTrendChart.data.labels = [];
          patientGrowthTrendChart.data.datasets.forEach(dataset => { dataset.data = []; });
          patientGrowthTrendChart.update();
          patientDopplerTrendChart.data.labels = [];
          patientDopplerTrendChart.data.datasets.forEach(dataset => { dataset.data = []; });
          patientDopplerTrendChart.update();
          return;
        }
        const labels = items.map((item) => `${formatDate(item.scanDate || item.updatedAt)} • ${item.reportType}`);
        patientGrowthTrendChart.data.labels = labels;
        patientGrowthTrendChart.data.datasets[0].data = items.map((item) => item.efw);
        patientGrowthTrendChart.data.datasets[1].data = items.map((item) => item.acPct);
        patientGrowthTrendChart.data.datasets[2].data = items.map((item) => item.efwPct);
        patientGrowthTrendChart.update();
        patientDopplerTrendChart.data.labels = labels;
        patientDopplerTrendChart.data.datasets[0].data = items.map((item) => item.mcaPi);
        patientDopplerTrendChart.data.datasets[1].data = items.map((item) => item.uaPi);
        patientDopplerTrendChart.data.datasets[2].data = items.map((item) => item.cpr);
        patientDopplerTrendChart.update();
        const efwValues = items.map((item) => item.efw).filter((value) => value != null);
        const dopplerCount = items.filter((item) => item.mcaPi != null || item.uaPi != null || item.cpr != null).length;
        const latest = items[items.length - 1];
        const earliest = items[0];
        const efwDelta = efwValues.length >= 2 ? (efwValues[efwValues.length - 1] - efwValues[0]) : null;
        const visitInterval = diffIsoDays(latest.scanDate, earliest.scanDate);
        const parts = [
          `<strong>Serial trend summary</strong> for ${escapeHtml(selected.patientName)} in the current branch scope.`,
          `Growth points available: ${escapeHtml(String(efwValues.length))}; Doppler points available: ${escapeHtml(String(dopplerCount))}.`,
          `Latest plotted visit: ${escapeHtml(formatDate(latest.scanDate || latest.updatedAt))} (${escapeHtml(latest.reportType)}; GA ${escapeHtml(latest.gaText || '-')}; EDD ${escapeHtml(formatDate(latest.primaryEdd))}).`
        ];
        if (visitInterval != null) parts.push(`Trend window spans approximately ${escapeHtml(String(visitInterval))} day(s).`);
        if (efwDelta != null) parts.push(`Net EFW change from earliest to latest plotted visit: ${escapeHtml(String(Math.round(efwDelta)))} g.`);
        if (!dopplerCount) parts.push('No Doppler-enabled saved visits are currently available to populate the Doppler chart.');
        setHtml('patientSerialTrendSummary', parts.join(' '));
      }
      function extractComparisonSnapshot(reportId) {
        const bundle = getVisitBundleByReportId(reportId);
        if (!bundle) return null;
        const { report, state, reportType, version } = bundle;
        const longi = extractLongitudinalMeta(report, version);
        const gaWeek = getSnapshotGaWeek(longi);
        const snapshot = {
          reportId: report.id,
          title: report.title || 'Untitled visit',
          reportType,
          status: report.status || version.status || 'Draft',
          version: version.version || 0,
          scanDate: longi.scanDate || '',
          primaryEdd: longi.primaryEdd || '',
          primarySource: longi.primarySource || '-',
          gaDatesDays: longi.gaDatesDays,
          gaBiometryDays: longi.gaBiometryDays,
          gaDatesText: longi.gaDatesText || '-',
          gaBiometryText: longi.gaBiometryText || '-',
          metricMap: {},
          lines: []
        };
        if (reportType === 'nt') {
          const crl = Number(state.crl || 0);
          const nt = Number(state.nt || 0);
          const expectedNt = crl ? interpolate(crl, crlPoints, ntExpectedCurve) : null;
          const p95 = crl ? interpolate(crl, crlPoints, ntP95Curve) : null;
          const p99 = crl ? interpolate(crl, crlPoints, ntP99Curve) : null;
          const risk = (crl && nt && Number(state.maternalAge || 0)) ? computeRisk(Number(state.maternalAge || 0), nt, expectedNt, p95, p99, state.nasalBone || 'present', state.dvFlow || 'normal', state.tricuspid || 'absent') : null;
          snapshot.metricMap.crl = crl || null;
          snapshot.metricMap.nt = nt || null;
          snapshot.metricMap.riskRatio = risk?.ratio || '';
          snapshot.lines = [
            `CRL: ${crl ? `${crl.toFixed(1)} mm` : '-'}`,
            `NT: ${nt ? `${nt.toFixed(1)} mm` : '-'}`,
            `GA by CRL: ${longi.gaBiometryText || '-'}`,
            `Primary EDD: ${formatDate(snapshot.primaryEdd)}`,
            `Risk ratio: ${risk?.ratio || '-'}`
          ];
          return snapshot;
        }
        if (reportType === 'level2' || reportType === 'biometry' || reportType === 'obdoppler') {
          const prefix = reportType === 'level2' ? 'l2' : (reportType === 'biometry' ? 'b' : 'o');
          const bpd = Number(state[`${prefix}Bpd`] || 0);
          const hc = Number(state[`${prefix}Hc`] || 0);
          const ac = Number(state[`${prefix}Ac`] || 0);
          const fl = Number(state[`${prefix}Fl`] || 0);
          const efw = Number(state[`${prefix}Efw`] || 0) || computeAutoEfw(bpd, ac, fl);
          const efwPct = gaWeek ? tablePercentile(efw, gaWeek, 'efw') : '-';
          const acPct = gaWeek ? tablePercentile(ac, gaWeek, 'ac') : '-';
          snapshot.metricMap.efw = efw || null;
          snapshot.metricMap.efwPct = efwPct;
          snapshot.metricMap.acPct = acPct;
          snapshot.lines = [
            `GA by dates: ${snapshot.gaDatesText || '-'}`,
            `GA by biometry: ${snapshot.gaBiometryText || '-'}`,
            `Primary EDD: ${formatDate(snapshot.primaryEdd)} (${snapshot.primarySource})`,
            `EFW: ${efw ? `${efw} g` : '-'} (${efwPct})`,
            `AC percentile: ${acPct}`
          ];
          if (reportType === 'level2') {
            snapshot.metricMap.mcaPi = Number(state.l2McaPi || 0) || null;
            snapshot.metricMap.uaPi = Number(state.l2UaPi || 0) || null;
            snapshot.metricMap.utPi = Number(state.l2UtPi || 0) || null;
            snapshot.lines.push(`Doppler: MCA ${state.l2McaPi || '-'} | UA ${state.l2UaPi || '-'} | UtA ${state.l2UtPi || '-'}`);
          }
          if (reportType === 'obdoppler') {
            const mcaPi = Number(state.oMcaPi || 0) || null;
            const uaPi = Number(state.oUaPi || 0) || null;
            const cpr = mcaPi && uaPi ? (mcaPi / uaPi) : null;
            snapshot.metricMap.mcaPi = mcaPi;
            snapshot.metricMap.uaPi = uaPi;
            snapshot.metricMap.cpr = cpr;
            snapshot.lines.push(`Doppler: MCA ${mcaPi != null ? mcaPi.toFixed(2) : '-'} | UA ${uaPi != null ? uaPi.toFixed(2) : '-'} | CPR ${cpr != null ? cpr.toFixed(2) : '-'}`);
          }
          return snapshot;
        }
        if (reportType === 'twins') {
          const aEfw = Number(state.tAEfw || 0) || computeAutoEfw(state.tABpd, state.tAAc, state.tAFl);
          const bEfw = Number(state.tBEfw || 0) || computeAutoEfw(state.tBBpd, state.tBAc, state.tBFl);
          const maxEfw = Math.max(aEfw || 0, bEfw || 0, 1);
          const discordance = (aEfw && bEfw) ? ((Math.abs(aEfw - bEfw) / maxEfw) * 100) : null;
          snapshot.metricMap.aEfw = aEfw || null;
          snapshot.metricMap.bEfw = bEfw || null;
          snapshot.metricMap.discordance = discordance;
          snapshot.lines = [
            `GA by dates: ${snapshot.gaDatesText || '-'}`,
            `Primary EDD: ${formatDate(snapshot.primaryEdd)} (${snapshot.primarySource})`,
            `Twin A EFW: ${aEfw ? `${aEfw} g` : '-'}`,
            `Twin B EFW: ${bEfw ? `${bEfw} g` : '-'}`,
            `Discordance: ${discordance != null ? `${discordance.toFixed(1)}%` : '-'}`
          ];
          return snapshot;
        }
        snapshot.lines = [`GA by dates: ${snapshot.gaDatesText || '-'}`, `GA by scan: ${snapshot.gaBiometryText || '-'}`, `Primary EDD: ${formatDate(snapshot.primaryEdd)} (${snapshot.primarySource})`];
        return snapshot;
      }
      function populatePatientComparisonSelectors(selected) {
        const selectA = $('patientCompareVisitA');
        const selectB = $('patientCompareVisitB');
        if (!selectA || !selectB) return;
        if (!selected || !selected.reports.length) {
          setHtml('patientCompareVisitA', '<option value="">No visit available</option>');
          setHtml('patientCompareVisitB', '<option value="">No visit available</option>');
          selectA.disabled = true;
          selectB.disabled = true;
          return;
        }
        const optionsHtml = selected.reports.map((visit) => `<option value="${visit.reportId}">${escapeHtml(formatVisitCompareOption(visit))}</option>`).join('');
        const previousA = selectA.value;
        const previousB = selectB.value;
        setHtml('patientCompareVisitA', optionsHtml);
        setHtml('patientCompareVisitB', optionsHtml);
        selectA.disabled = false;
        selectB.disabled = selected.reports.length < 2;
        const fallbackA = selected.reports[0]?.reportId || '';
        const fallbackB = selected.reports[1]?.reportId || selected.reports[0]?.reportId || '';
        selectA.value = selected.reports.some((visit) => visit.reportId === previousA) ? previousA : fallbackA;
        selectB.value = selected.reports.some((visit) => visit.reportId === previousB) ? previousB : fallbackB;
        if (selectA.value === selectB.value && selected.reports.length > 1) selectB.value = selected.reports.find((visit) => visit.reportId !== selectA.value)?.reportId || fallbackB;
      }
      function renderPatientVisitComparison() {
        const selected = getSelectedPatientMaster();
        const summaryEl = $('patientVisitCompareSummary');
        const panelEl = $('patientVisitComparePanel');
        const selectA = $('patientCompareVisitA');
        const selectB = $('patientCompareVisitB');
        if (!summaryEl || !panelEl) return;
        populatePatientComparisonSelectors(selected);
        if (!selected || !selectA?.value || !selectB?.value) {
          setHtml('patientVisitCompareSummary', 'Select a patient with at least two saved visits to review side-by-side dating, growth, and Doppler changes.');
          setHtml('patientVisitComparePanel', '');
          return;
        }
        const snapA = extractComparisonSnapshot(selectA.value);
        const snapB = extractComparisonSnapshot(selectB.value);
        if (!snapA || !snapB) {
          setHtml('patientVisitCompareSummary', 'Comparison data could not be derived from the selected saved visits.');
          setHtml('patientVisitComparePanel', '');
          return;
        }
        const intervalDays = diffIsoDays(snapA.scanDate, snapB.scanDate);
        const eddDriftDays = diffIsoDays(snapA.primaryEdd, snapB.primaryEdd);
        const gaA = snapA.gaDatesDays ?? snapA.gaBiometryDays;
        const gaB = snapB.gaDatesDays ?? snapB.gaBiometryDays;
        const progressionDrift = intervalDays != null && gaA != null && gaB != null ? Math.abs((gaA - gaB) - intervalDays) : null;
        const efwDelta = (snapA.metricMap.efw != null && snapB.metricMap.efw != null) ? (snapA.metricMap.efw - snapB.metricMap.efw) : null;
        const cprDelta = (snapA.metricMap.cpr != null && snapB.metricMap.cpr != null) ? (snapA.metricMap.cpr - snapB.metricMap.cpr) : null;
        const ntDelta = (snapA.metricMap.nt != null && snapB.metricMap.nt != null) ? (snapA.metricMap.nt - snapB.metricMap.nt) : null;
        const discordanceDelta = (snapA.metricMap.discordance != null && snapB.metricMap.discordance != null) ? (snapA.metricMap.discordance - snapB.metricMap.discordance) : null;
        const summaryCards = [
          '<div class="longitudinal-chip"><strong>Visit interval</strong>' + escapeHtml(intervalDays != null ? `${intervalDays} day(s)` : '-') + '</div>',
          '<div class="longitudinal-chip"><strong>EDD difference</strong>' + escapeHtml(eddDriftDays != null ? `${eddDriftDays} day(s)` : '-') + '</div>',
          '<div class="longitudinal-chip"><strong>GA progression drift</strong>' + escapeHtml(progressionDrift != null ? `${progressionDrift} day(s)` : '-') + '</div>',
          '<div class="longitudinal-chip"><strong>Compared tabs</strong>' + escapeHtml(`${snapA.reportType} ↔ ${snapB.reportType}`) + '</div>'
        ].join('');
        const deltaLines = [];
        if (efwDelta != null) deltaLines.push(`EFW change: ${efwDelta > 0 ? '+' : ''}${Math.round(efwDelta)} g`);
        if (cprDelta != null) deltaLines.push(`CPR change: ${cprDelta > 0 ? '+' : ''}${cprDelta.toFixed(2)}`);
        if (ntDelta != null) deltaLines.push(`NT change: ${ntDelta > 0 ? '+' : ''}${ntDelta.toFixed(1)} mm`);
        if (discordanceDelta != null) deltaLines.push(`Twin discordance change: ${discordanceDelta > 0 ? '+' : ''}${discordanceDelta.toFixed(1)}%`);
        setHtml('patientVisitCompareSummary', '<div><strong>Side-by-side review</strong> for the selected saved visits of this patient.</div><div class="comparison-summary-grid">' + summaryCards + '</div><div class="longitudinal-helper">' + escapeHtml(deltaLines.length ? deltaLines.join(' • ') : 'No direct numeric delta could be derived from the current visit pairing.') + '</div>');
        const columnHtml = (label, snap) => '<div class="comparison-card">'
          + '<h4>' + escapeHtml(label) + '</h4>'
          + '<div class="saved-report-sub">' + escapeHtml(snap.title) + '</div>'
          + '<div class="saved-report-sub">' + escapeHtml(formatDate(snap.scanDate)) + ' • ' + escapeHtml(snap.reportType) + ' • v' + escapeHtml(String(snap.version)) + '</div>'
          + '<div style="margin-top:8px;">' + makeBadge(snap.status || 'Draft', snap.status === 'Final' ? 'badge-green' : (snap.status === 'Amended' ? 'badge-amber' : 'badge-green')) + '</div>'
          + '<div class="comparison-metric-list" style="margin-top:10px;">' + snap.lines.map((line) => '<div>' + escapeHtml(line) + '</div>').join('') + '</div>'
          + '</div>';
        setHtml('patientVisitComparePanel', columnHtml('Visit A', snapA) + columnHtml('Visit B', snapB));
      }
      function buildPatientMasterIndex() {
        const masterMap = new Map();
        getSavedReports().forEach((report) => {
          const latestVersion = report.versions?.[report.versions.length - 1] || null;
          const visitMeta = extractVisitMetaFromVersion(report, latestVersion);
          const key = normalizePatientMasterKey(report.patientName, report.patientId);
          const existing = masterMap.get(key) || {
            key,
            patientName: report.patientName || 'Unnamed Patient',
            patientId: report.patientId || 'No ID',
            visitCount: 0,
            lastVisitDate: '',
            lastUpdated: '',
            latestAge: '',
            latestDoctor: '',
            latestIndication: '',
            latestReportTitle: '',
            latestReportType: '',
            latestStatus: '',
            tabs: new Set(),
            reports: []
          };
          existing.visitCount += 1;
          existing.patientName = report.patientName || existing.patientName;
          existing.patientId = report.patientId || existing.patientId;
          existing.tabs.add(report.reportType || visitMeta.reportType || 'nt');
          const visitRecord = {
            reportId: report.id,
            title: report.title,
            reportType: report.reportType || visitMeta.reportType || 'nt',
            status: report.status,
            updatedAt: report.updatedAt,
            scanDate: visitMeta.scanDate,
            age: visitMeta.age,
            doctor: visitMeta.doctor,
            indication: visitMeta.indication,
            latestNote: report.latestNote || visitMeta.note || '',
            latestVersion: latestVersion?.version || 0,
            hasFinal: !!report.versions?.some(version => version.status === 'Final')
          };
          existing.reports.push(visitRecord);
          if (getReportVisitSortValue(visitRecord) >= getReportVisitSortValue({ scanDate: existing.lastVisitDate, updatedAt: existing.lastUpdated })) {
            existing.lastVisitDate = visitRecord.scanDate;
            existing.lastUpdated = visitRecord.updatedAt;
            existing.latestAge = visitRecord.age || existing.latestAge;
            existing.latestDoctor = visitRecord.doctor || existing.latestDoctor;
            existing.latestIndication = visitRecord.indication || existing.latestIndication;
            existing.latestReportTitle = visitRecord.title || existing.latestReportTitle;
            existing.latestReportType = visitRecord.reportType || existing.latestReportType;
            existing.latestStatus = visitRecord.status || existing.latestStatus;
          }
          masterMap.set(key, existing);
        });
        return Array.from(masterMap.values()).map((item) => ({
          ...item,
          tabs: Array.from(item.tabs),
          reports: item.reports.sort((a, b) => getReportVisitSortValue(b) - getReportVisitSortValue(a))
        }));
      }
      function getFilteredSortedPatientMasters() {
        const query = ($('patientMasterSearch')?.value || '').trim().toLowerCase();
        const sortOrder = ($('patientMasterSort')?.value || 'recent').trim();
        const masters = buildPatientMasterIndex().filter((item) => {
          const haystack = [item.patientName, item.patientId, item.latestReportTitle, item.latestDoctor, item.tabs.join(' ')].join(' ').toLowerCase();
          return !query || haystack.includes(query);
        });
        masters.sort((a, b) => {
          if (sortOrder === 'name_az') return String(a.patientName || '').localeCompare(String(b.patientName || ''));
          if (sortOrder === 'name_za') return String(b.patientName || '').localeCompare(String(a.patientName || ''));
          if (sortOrder === 'visits_desc') return (b.visitCount - a.visitCount) || String(a.patientName || '').localeCompare(String(b.patientName || ''));
          return getReportVisitSortValue({ scanDate: b.lastVisitDate, updatedAt: b.lastUpdated }) - getReportVisitSortValue({ scanDate: a.lastVisitDate, updatedAt: a.lastUpdated });
        });
        return masters;
      }
      function getSelectedPatientMaster() {
        return buildPatientMasterIndex().find((item) => item.key === selectedPatientMasterKey) || null;
      }
      function renderPatientMasterList() {
        const masters = getFilteredSortedPatientMasters();
        if (selectedPatientMasterKey && !buildPatientMasterIndex().some(item => item.key === selectedPatientMasterKey)) selectedPatientMasterKey = null;
        if (!masters.length) {
          setHtml('patientMasterList', '<div class="saved-report-item"><div class="saved-report-sub">No saved patient master record found in the current branch scope yet.</div></div>');
          return;
        }
        setHtml('patientMasterList', masters.map((item) => {
          const selectedClass = item.key === selectedPatientMasterKey ? ' selected-patient-master' : '';
          const chips = [`<span class="timeline-chip">Visits: ${item.visitCount}</span>`, `<span class="timeline-chip">Latest tab: ${escapeHtml(item.latestReportType || '-')}</span>`, `<span class="timeline-chip">Last visit: ${escapeHtml(formatDate(item.lastVisitDate || item.lastUpdated))}</span>`].join('');
          return `<div class="saved-report-item${selectedClass}"><div class="saved-report-item-header"><div><div class="saved-report-title">${escapeHtml(item.patientName)}</div><div class="saved-report-sub">UHID: ${escapeHtml(item.patientId || 'No ID')}</div></div><div>${makeBadge(item.latestStatus || 'Draft', item.latestStatus === 'Final' ? 'badge-green' : (item.latestStatus === 'Amended' ? 'badge-amber' : 'badge-green'))}</div></div><div class="patient-master-meta">${chips}</div><div class="saved-report-sub" style="margin-top:8px;">Tabs linked: ${escapeHtml(item.tabs.join(', ') || '-')}</div><div class="saved-report-actions"><button class="mini-btn" data-patient-master-action="select" data-patient-master-key="${escapeHtml(item.key)}">Select</button><button class="mini-btn" data-patient-master-action="load-latest" data-patient-master-key="${escapeHtml(item.key)}">Load Latest Visit</button></div></div>`;
        }).join(''));
      }
      function renderPatientMasterSummary() {
        const selected = getSelectedPatientMaster();
        if ($('copyPatientToActiveTabBtn')) $('copyPatientToActiveTabBtn').disabled = !selected;
        if ($('loadLatestPatientVisitBtn')) $('loadLatestPatientVisitBtn').disabled = !selected;
        if ($('createPatientMasterVisitBtn')) $('createPatientMasterVisitBtn').disabled = !selected;
        if (!selected) {
          setHtml('patientMasterSummary', 'Select a patient from the master index to see linked visits across the current branch scope.');
          return;
        }
        const ageText = selected.latestAge ? (String(selected.latestAge) + ' years') : '-';
        const lines = [
          '<div><strong>Patient:</strong> ' + escapeHtml(selected.patientName) + '</div>',
          '<div><strong>UHID:</strong> ' + escapeHtml(selected.patientId || 'No ID') + '</div>',
          '<div><strong>Total linked visits:</strong> ' + String(selected.visitCount) + '</div>',
          '<div><strong>Latest visit date:</strong> ' + escapeHtml(formatDate(selected.lastVisitDate || selected.lastUpdated)) + '</div>',
          '<div><strong>Latest report:</strong> ' + escapeHtml(selected.latestReportTitle || '-') + ' (' + escapeHtml(selected.latestReportType || '-') + ')</div>',
          '<div><strong>Latest status:</strong> ' + escapeHtml(selected.latestStatus || '-') + '</div>',
          '<div><strong>Latest age:</strong> ' + escapeHtml(ageText) + '</div>',
          '<div><strong>Latest doctor:</strong> ' + escapeHtml(selected.latestDoctor || '-') + '</div>',
          '<div><strong>Latest indication:</strong> ' + escapeHtml(selected.latestIndication || '-') + '</div>',
          '<div><strong>Tabs linked:</strong> ' + escapeHtml((selected.tabs || []).join(', ') || '-') + '</div>'
        ];
        setHtml('patientMasterSummary', lines.join(''));
      }
      function renderPatientVisitTimeline() {
        const selected = getSelectedPatientMaster();
        if (!selected) {
          setHtml('patientVisitTimeline', '<div class="version-history-item"><div class="version-history-sub">No patient selected.</div></div>');
          return;
        }
        const html = selected.reports.map((visit) => {
          const chips = [
            '<span class="timeline-chip">' + escapeHtml(visit.reportType) + '</span>',
            '<span class="timeline-chip">Scan: ' + escapeHtml(formatDate(visit.scanDate || visit.updatedAt)) + '</span>',
            '<span class="timeline-chip">Version: v' + String(visit.latestVersion) + '</span>'
          ].join('');
          const doctorSuffix = visit.doctor ? (' • ' + escapeHtml(visit.doctor)) : '';
          const finalBtn = visit.hasFinal ? ('<button class="mini-btn" data-patient-visit-action="restore-final" data-report-id="' + escapeHtml(visit.reportId) + '">Restore Latest Final</button>') : '';
          return '<div class="version-history-item">'
            + '<div class="version-history-item-header"><div><div class="version-history-title">' + escapeHtml(visit.title || 'Untitled visit') + '</div><div class="version-history-sub">' + escapeHtml(visit.indication || '-') + doctorSuffix + '</div></div><div>' + makeBadge(visit.status || 'Draft', visit.status === 'Final' ? 'badge-green' : (visit.status === 'Amended' ? 'badge-amber' : 'badge-green')) + '</div></div>'
            + '<div class="patient-master-meta">' + chips + '</div>'
            + '<div class="version-history-sub" style="margin-top:8px;">Latest note: ' + escapeHtml(visit.latestNote || '-') + '</div>'
            + '<div class="version-history-actions"><button class="mini-btn" data-patient-visit-action="load" data-report-id="' + escapeHtml(visit.reportId) + '">Load Visit</button>' + finalBtn + '</div>'
            + '</div>';
        }).join('');
        setHtml('patientVisitTimeline', html);
      }
      function renderPatientMasterWorkspace() {
        if (selectedPatientMasterKey && !buildPatientMasterIndex().some(item => item.key === selectedPatientMasterKey)) selectedPatientMasterKey = null;
        renderPatientMasterList();
        renderPatientMasterSummary();
        renderPatientVisitComparison();
        renderPatientLongitudinalSummary();
        renderPatientLongitudinalTimeline();
        renderPatientSerialTrendCharts();
        renderPatientVisitTimeline();
      }
      function selectCurrentPatientMaster() {
        const patient = getPrimaryPatientDetailsForTab(getActiveTabName());
        const key = normalizePatientMasterKey(patient.patientName, patient.patientId);
        const exists = buildPatientMasterIndex().some(item => item.key === key);
        selectedPatientMasterKey = exists ? key : null;
        renderPatientMasterWorkspace();
        if (!exists) setHtml('patientMasterSummary', `No saved visit is currently linked for <strong>${escapeHtml(patient.patientName)}</strong> (${escapeHtml(patient.patientId)}). Save the current workspace first to add it into the patient master timeline.`);
      }
      function clearPatientMasterSelection() {
        selectedPatientMasterKey = null;
        renderPatientMasterWorkspace();
        renderMonthlyReportPanel();
      }
      function copySelectedPatientToActiveTab() {
        const selected = getSelectedPatientMaster();
        if (!selected) return;
        const fieldMap = getPatientFieldMapByTab(getActiveTabName());
        if ($(fieldMap.nameId)) $(fieldMap.nameId).value = selected.patientName || '';
        if ($(fieldMap.idId)) $(fieldMap.idId).value = selected.patientId || '';
        if ($(fieldMap.ageId) && selected.latestAge) $(fieldMap.ageId).value = selected.latestAge;
        updateWhatsappPreview();
        const recalcMap = { nt: calculateAll, level2: calculateLevel2, biometry: calculateBiometry, obdoppler: calculateObDoppler, twins: calculateTwins };
        (recalcMap[getActiveTabName()] || calculateAll)();
      }
      function loadLatestSelectedPatientVisit() {
        const selected = getSelectedPatientMaster();
        if (!selected || !selected.reports.length) return;
        loadSavedReport(selected.reports[0].reportId);
      }
      function renderSavedReports() {
        var filtered = getFilteredSortedReports();
        updateReportResultCount(filtered);
        if (!filtered.length) {
          updateReportResultCount([]);
          setHtml('savedReportsList', '<div class="saved-report-item"><div class="saved-report-sub">No saved reports found for <strong>' + escapeHtml(getCurrentScopeLabel()) + '</strong> under the current search / filter.</div></div>');
          renderSavedFormFs();
          renderPatientMasterWorkspace();
          renderMonthlyReportPanel();
          renderComplianceDashboard();
          renderReceptionDesk();
          return;
        }
        var html = filtered.map(function(report) {
          var latest = report.versions && report.versions.length ? report.versions[report.versions.length - 1] : {};
          var hasFinal = (report.versions || []).some(function(version) { return version.status === 'Final'; });
          var actions = ['<button class="mini-btn" data-report-action="load" data-report-id="' + escapeHtml(report.id) + '">Load</button>'];
          if (hasPermission('duplicate')) actions.push('<button class="mini-btn" data-report-action="duplicate" data-report-id="' + escapeHtml(report.id) + '">Duplicate</button>');
          if (hasFinal) actions.push('<button class="mini-btn" data-report-action="restore-final" data-report-id="' + escapeHtml(report.id) + '">Restore Latest Final</button>');
          if (hasPermission('deleteReport')) actions.push('<button class="mini-btn" data-report-action="delete" data-report-id="' + escapeHtml(report.id) + '">Delete</button>');
          var badgeTone = report.status === 'Final' ? 'badge-green' : (report.status === 'Amended' ? 'badge-amber' : 'badge-green');
          return '<div class="saved-report-item">'
            + '<div class="saved-report-item-header"><div><div class="saved-report-title">' + escapeHtml(report.title) + '</div><div class="saved-report-sub">' + escapeHtml(getSavedReportPublicId(report)) + ' • ' + escapeHtml(report.patientName) + ' • ' + escapeHtml(report.patientId) + ' • ' + escapeHtml(report.reportType) + '</div></div><div>' + makeBadge(report.status, badgeTone) + '</div></div>'
            + '<div class="saved-report-sub">Scope: ' + escapeHtml(report.centerName || 'Guest') + ' • ' + escapeHtml(report.branchName || 'Default') + '</div>'
            + '<div class="saved-report-sub">Updated: ' + escapeHtml(formatDate(report.updatedAt)) + ' • Version: v' + escapeHtml(String(latest.version || 0)) + '</div>'
            + '<div class="saved-report-sub">Latest note: ' + escapeHtml(latest.note || '-') + '</div>'
            + '<div class="saved-report-actions">' + actions.join('') + '</div>'
            + '</div>';
        }).join('');
        setHtml('savedReportsList', html);
        renderSavedFormFs();
        renderPatientMasterWorkspace();
        renderMonthlyReportPanel();
        renderComplianceDashboard();
        renderReceptionDesk();
      }
      function createNewReport(initialStatus = 'Draft') {
        const activeTab = getActiveTabName();
        if (!ensureDraftRequirements(activeTab, initialStatus === 'Final' ? 'finalize the report' : 'save the report')) return;
        if (initialStatus === 'Final') {
          const validation = getFinalizeValidationPayload(activeTab);
          renderFinalizeValidationBox(validation);
          if (validation.issues.length) return;
        }
        const reports = getSavedReports(), patient = getPrimaryPatientDetailsForTab(activeTab), center = getCurrentCenter(), branch = getCurrentBranch(center);
        selectedPatientMasterKey = normalizePatientMasterKey(patient.patientName, patient.patientId);
        const title = ($('workspaceReportTitle')?.value || '').trim() || getSuggestedReportTitle(activeTab, patient);
        const note = ($('workspaceVersionNote')?.value || '').trim() || (initialStatus === 'Final' ? 'Marked final' : (initialStatus === 'Amended' ? 'Initial amended version' : 'Initial saved draft'));
        const versionEntry = buildVersionEntry(initialStatus, note); versionEntry.version = 1;
        const report = { id: makeUniqueReportId(), title, patientName: patient.patientName, patientId: patient.patientId, reportType: activeTab, centerId: center?.id || 'guest', centerName: center?.displayName || 'Guest / local scope', branchId: branch?.id || 'default', branchName: branch?.name || $('brandBranchName').value.trim() || 'Default Branch', status: initialStatus, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), latestNote: note, versions: [versionEntry], auditTrail: [buildAuditEntry(initialStatus === 'Final' ? 'Created and finalized report' : 'Created draft', note)] };
        assignReportSerialMeta(report, reports);
        reports.push(report);
        persistSavedReports(reports);
        currentLoadedReportId = report.id;
        syncReceptionEntryForReport(report);
        currentEditMode = 'normal';
        if ($('workspaceReportTitle')) $('workspaceReportTitle').value = title;
        const recalcMap = { nt: calculateAll, level2: calculateLevel2, biometry: calculateBiometry, obdoppler: calculateObDoppler, twins: calculateTwins };
        (recalcMap[activeTab] || calculateAll)();
        if (initialStatus === 'Final') ensureLinkedFormFRecord(report, true);
        renderSavedReports();
        renderVersionHistory(report);
        updateCurrentReportInfo(report, versionEntry);
        renderFinalizeValidationBox();
      }
      function appendVersionToCurrent(mode = 'update') {
        const draftActionLabel = mode === 'final' ? 'finalize the report' : (mode === 'amend' ? 'save the amendment' : 'update the report');
        if (!ensureDraftRequirements(getActiveTabName(), draftActionLabel)) return;
        if (!currentLoadedReportId) {
          createNewReport(mode === 'final' ? 'Final' : (mode === 'amend' ? 'Amended' : 'Draft'));
          currentEditMode = 'normal';
          return;
        }
        const activeTab = getActiveTabName();
        if (mode === 'final') {
          const validation = getFinalizeValidationPayload(activeTab);
          renderFinalizeValidationBox(validation);
          if (validation.issues.length) return;
        }
        const reports = getSavedReports();
        const report = reports.find(item => item.id === currentLoadedReportId);
        if (!report) {
          createNewReport(mode === 'final' ? 'Final' : (mode === 'amend' ? 'Amended' : 'Draft'));
          currentEditMode = 'normal';
          return;
        }
        if (['Final','Amended'].includes(report.status) && currentEditMode !== 'amendment' && mode === 'update') {
          applyRoleAndLockState();
          return;
        }
        const patient = getPrimaryPatientDetailsForTab(activeTab), center = getCurrentCenter(), branch = getCurrentBranch(center);
        selectedPatientMasterKey = normalizePatientMasterKey(patient.patientName, patient.patientId);
        report.title = ($('workspaceReportTitle')?.value || '').trim() || report.title || getSuggestedReportTitle(activeTab, patient);
        report.patientName = patient.patientName;
        report.patientId = patient.patientId;
        report.reportType = activeTab;
        report.centerId = center?.id || 'guest';
        report.centerName = center?.displayName || 'Guest / local scope';
        report.branchId = branch?.id || 'default';
        report.branchName = branch?.name || $('brandBranchName').value.trim() || 'Default Branch';
        if (currentEditMode === 'amendment') mode = 'amend';
        const nextStatus = mode === 'final' ? 'Final' : (mode === 'amend' ? 'Amended' : report.status || 'Draft');
        const defaultNote = mode === 'final' ? 'Marked final' : (mode === 'amend' ? 'Amendment created' : 'Routine update');
        const note = ($('workspaceVersionNote')?.value || '').trim() || defaultNote;
        if (mode === 'amend' && !note.trim()) {
          const lockEl = $('currentLockState');
          if (lockEl) {
            lockEl.className = 'lock-banner locked';
            lockEl.innerHTML = 'Amendment note is mandatory before saving an amended report.';
          }
          return;
        }
        assignReportSerialMeta(report, reports);
        const versionEntry = buildVersionEntry(nextStatus, note); versionEntry.version = (report.versions[report.versions.length - 1]?.version || 0) + 1;
        report.status = nextStatus;
        report.updatedAt = new Date().toISOString();
        report.latestNote = versionEntry.note;
        report.versions.push(versionEntry);
        if (!Array.isArray(report.auditTrail)) report.auditTrail = [];
        report.auditTrail.push(buildAuditEntry(mode === 'final' ? 'Marked final' : (mode === 'amend' ? 'Saved amendment' : 'Updated draft'), note));
        persistSavedReports(reports);
        syncReceptionEntryForReport(report);
        currentEditMode = 'normal';
        const recalcMap = { nt: calculateAll, level2: calculateLevel2, biometry: calculateBiometry, obdoppler: calculateObDoppler, twins: calculateTwins };
        (recalcMap[activeTab] || calculateAll)();
        if (mode === 'final') ensureLinkedFormFRecord(report, true);
        renderSavedReports();
        renderVersionHistory(report);
        updateCurrentReportInfo(report, versionEntry);
        renderFinalizeValidationBox();
      }
      function loadSavedReport(reportId, versionNumber = null) { const reports = getSavedReports(); const report = reports.find(item => item.id === reportId); if (!report) return; const versionEntry = versionNumber ? report.versions.find(v => v.version === Number(versionNumber)) : report.versions[report.versions.length - 1]; if (!versionEntry) return; currentLoadedReportId = report.id; currentEditMode = 'normal'; restoreWorkspaceState(versionEntry.state || {}); if ($('workspaceReportTitle')) $('workspaceReportTitle').value = report.title || ''; if ($('workspaceVersionNote')) $('workspaceVersionNote').value = versionEntry.note || ''; switchTab(versionEntry.activeTab || report.reportType || 'nt'); refreshAllCalculatedViews(); renderSavedReports(); renderVersionHistory(report); updateCurrentReportInfo(report, versionEntry); }
      function deleteSavedReport(reportId) { const reports = getSavedReports().filter(item => item.id !== reportId); persistSavedReports(reports); if (currentLoadedReportId === reportId) { currentLoadedReportId = null; currentEditMode = 'normal'; renderVersionHistory(null); renderAuditTrail(null); updateCurrentReportInfo(null, null); } renderSavedReports(); }
      function duplicateReport(reportId = currentLoadedReportId) { const reports = getSavedReports(); const source = reports.find(item => item.id === reportId); if (!source) return; const latest = source.versions[source.versions.length - 1]; const now = new Date().toISOString(); const user = getCurrentUserContext(); const duplicate = { ...source, id: makeUniqueReportId(), title: `${source.title} (Copy)`, status: 'Draft', createdAt: now, updatedAt: now, latestNote: `Duplicated from ${source.title}`, versions: [{ version: 1, timestamp: now, status: 'Draft', note: `Duplicated from ${source.title}`, activeTab: latest?.activeTab || source.reportType || 'nt', state: JSON.parse(JSON.stringify(latest?.state || {})), actorName: user.userName, actorRole: user.roleLabel }], auditTrail: [buildAuditEntry('Duplicated report', `Duplicated from ${source.title}`)] }; reports.push(duplicate); persistSavedReports(reports); loadSavedReport(duplicate.id); }
      function restoreLatestFinalVersion(reportId = currentLoadedReportId) { const reports = getSavedReports(); const report = reports.find(item => item.id === reportId); if (!report) return; const latestFinal = [...report.versions].filter(version => version.status === 'Final').sort((a, b) => b.version - a.version)[0]; if (!latestFinal) return; loadSavedReport(report.id, latestFinal.version); }
      function exportReportsBackup() { const reports = getSavedReports(), center = getCurrentCenter(), branch = getCurrentBranch(center); const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `astraia-like-v62-${(center?.id || 'guest')}-${(branch?.id || 'default')}-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }
      function importReportsBackupFromFile(file) { if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const parsed = JSON.parse(String(reader.result || '[]')); if (!Array.isArray(parsed)) return; const existing = getSavedReports(); const existingIds = new Set(existing.map(report => report.id)); const normalized = parsed.map(normalizeImportedReport).map(report => { if (existingIds.has(report.id)) report.id = makeUniqueReportId(); existingIds.add(report.id); return report; }); persistSavedReports([...existing, ...normalized]); renderSavedReports(); } catch (_) {} }; reader.readAsText(file); }
      function getScopedFormFStorageKey() {
        var session = getActiveCenterSession();
        var centerId = session && session.centerId ? session.centerId : 'guest';
        var branchId = session && session.branchId ? session.branchId : 'default';
        return FORMF_STORAGE_KEY_PREFIX + '__' + centerId + '__' + branchId;
      }
      function getSavedFormFs() {
        try {
          var parsed = JSON.parse(localStorage.getItem(getScopedFormFStorageKey()) || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          return [];
        }
      }
      function persistSavedFormFs(forms) {
        localStorage.setItem(getScopedFormFStorageKey(), JSON.stringify(forms));
        queueAutoSyncScope('formf-save');
      }
      function makeUniqueFormFId() {
        return 'FORMF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      }
      function setFormFFieldValue(id, value) {
        var el = document.getElementById(id);
        if (el) el.value = value == null ? '' : String(value);
      }
      function serializeFormFWorkspace() {
        var data = {};
        FORMF_FIELD_IDS.forEach(function(id) {
          var el = document.getElementById(id);
          if (el) data[id] = el.value;
        });
        var linked = document.getElementById('formFLinkedReportStorageId');
        data.formFLinkedReportStorageId = linked ? linked.value : '';
        return data;
      }
      function restoreFormFWorkspace(data) {
        var payload = data || {};
        FORMF_FIELD_IDS.forEach(function(id) {
          setFormFFieldValue(id, Object.prototype.hasOwnProperty.call(payload, id) ? payload[id] : '');
        });
        var linked = document.getElementById('formFLinkedReportStorageId');
        if (linked) linked.value = payload.formFLinkedReportStorageId || '';
        updateFormFPrintable();
      }
      function updateCurrentFormFInfo(record) {
        if (!record) {
          setHtml('formFCurrentInfo', 'No saved Form F loaded yet. Use Autofill from Current Case to pull data from the active scan tab.');
          return;
        }
        setHtml('formFCurrentInfo', '<div><strong>Current Form F:</strong> ' + escapeHtml(record.id) + '</div><div><strong>Patient:</strong> ' + escapeHtml(record.patientName || '-') + ' (' + escapeHtml(record.patientId || '-') + ')</div><div><strong>Linked report:</strong> ' + escapeHtml(record.linkedReportPublicId || '-') + '</div><div><strong>Status:</strong> ' + escapeHtml(record.status || 'Draft') + ' • <strong>Updated:</strong> ' + escapeHtml(formatDate(record.updatedAt)) + '</div>');
      }
      function clearFormFWorkspace() {
        currentLoadedFormFId = null;
        restoreFormFWorkspace({
          formFRecordId: '',
          formFLinkedReportPublicId: '',
          formFStatus: 'Draft',
          formFClinicAddress: document.getElementById('brandAddress') ? document.getElementById('brandAddress').value : '',
          formFClinicRegNo: document.getElementById('brandRegistration') ? document.getElementById('brandRegistration').value : '',
          formFPatientName: '',
          formFPatientId: '',
          formFPatientAge: '',
          formFTotalLivingChildren: '0',
          formFLivingSonsDetail: '0',
          formFLivingDaughtersDetail: '0',
          formFRelativeName: '',
          formFPatientAddress: '',
          formFPatientPhone: '',
          formFLmp: '',
          formFScanDate: '',
          formFGaWeeks: '',
          formFGaDays: '',
          formFGravida: '1',
          formFPara: '0',
          formFLiving: '0',
          formFAbortions: '0',
          formFMaleChildren: '0',
          formFFemaleChildren: '0',
          formFReferredBy: '',
          formFSelfReferral: '',
          formFDoctorName: document.getElementById('brandConsultant') ? document.getElementById('brandConsultant').value : '',
          formFReferralRegNo: '',
          formFProcedureType: '',
          formFProcedureOther: '',
          formFIndication: '',
          formFClinicalSummary: '',
          formFDeclarationDate: '',
          formFResultConveyedTo: 'Patient',
          formFResultConveyedOn: '',
          formFMtpIndication: '',
          formFCentreName: document.getElementById('brandClinicName') ? document.getElementById('brandClinicName').value : '',
          formFConsultantName: document.getElementById('brandConsultant') ? document.getElementById('brandConsultant').value : '',
          formFConsultantReg: document.getElementById('brandRegistration') ? document.getElementById('brandRegistration').value : '',
          formFPatientDeclarationName: '',
          formFPatientDeclarationProcedure: 'ultrasonography / image scanning',
          formFDeclaration: "I declare that while conducting ultrasonography / image scanning, I have neither detected nor disclosed the sex of the foetus to anybody in any manner.",
          formFLinkedReportStorageId: ''
        });
        updateCurrentFormFInfo(null);
      }
      function getCollapsedText(id) {
        var el = document.getElementById(id);
        return String(el ? el.textContent : '').split(' ').filter(Boolean).join(' ').trim();
      }
      function getActiveCaseAutofill() {
        var activeTab = getActiveTabName();
        var consultantName = document.getElementById('brandConsultant') ? document.getElementById('brandConsultant').value : '';
        var common = {
          formFRecordId: document.getElementById('formFRecordId') ? document.getElementById('formFRecordId').value : '',
          formFLinkedReportStorageId: currentLoadedReportId || '',
          formFStatus: document.getElementById('formFStatus') ? document.getElementById('formFStatus').value : 'Draft',
          formFClinicAddress: document.getElementById('brandAddress') ? document.getElementById('brandAddress').value : '',
          formFClinicRegNo: document.getElementById('brandRegistration') ? document.getElementById('brandRegistration').value : '',
          formFPatientAddress: document.getElementById('formFPatientAddress') ? document.getElementById('formFPatientAddress').value : '',
          formFPatientPhone: document.getElementById('formFPatientPhone') ? document.getElementById('formFPatientPhone').value : '',
          formFGravida: document.getElementById('formFGravida') ? document.getElementById('formFGravida').value : '1',
          formFPara: document.getElementById('formFPara') ? document.getElementById('formFPara').value : '0',
          formFLiving: document.getElementById('formFLiving') ? document.getElementById('formFLiving').value : '0',
          formFAbortions: document.getElementById('formFAbortions') ? document.getElementById('formFAbortions').value : '0',
          formFMaleChildren: document.getElementById('formFMaleChildren') ? document.getElementById('formFMaleChildren').value : '0',
          formFFemaleChildren: document.getElementById('formFFemaleChildren') ? document.getElementById('formFFemaleChildren').value : '0',
          formFReferralRegNo: document.getElementById('formFReferralRegNo') ? document.getElementById('formFReferralRegNo').value : '',
          formFCentreName: document.getElementById('brandClinicName') ? document.getElementById('brandClinicName').value : '',
          formFConsultantName: consultantName,
          formFConsultantReg: document.getElementById('brandRegistration') ? document.getElementById('brandRegistration').value : '',
          formFDoctorName: consultantName,
          formFDeclaration: "I declare that while conducting ultrasonography / image scanning, I have neither detected nor disclosed the sex of the foetus to anybody in any manner.",
          formFDeclarationDate: '',
          formFResultConveyedTo: 'Patient',
          formFResultConveyedOn: '',
          formFProcedureOther: '',
          formFSelfReferral: '',
          formFRelativeName: document.getElementById('formFRelativeName') ? document.getElementById('formFRelativeName').value : '',
          formFLinkedReportPublicId: '',
          formFTotalLivingChildren: document.getElementById('formFLiving') ? document.getElementById('formFLiving').value : '0',
          formFLivingSonsDetail: document.getElementById('formFMaleChildren') ? document.getElementById('formFMaleChildren').value : '0',
          formFLivingDaughtersDetail: document.getElementById('formFFemaleChildren') ? document.getElementById('formFFemaleChildren').value : '0',
          formFPatientDeclarationName: '',
          formFPatientDeclarationProcedure: 'ultrasonography / image scanning',
          formFMtpIndication: document.getElementById('formFMtpIndication') ? document.getElementById('formFMtpIndication').value : ''
        };

        if (activeTab === 'nt') {
          var ntGa = gaByCrl(Number(document.getElementById('crl') ? document.getElementById('crl').value : 0));
          return Object.assign({}, common, {
            formFLinkedReportPublicId: getCollapsedText('ntReportId'),
            formFPatientName: document.getElementById('patientName') ? document.getElementById('patientName').value : '',
            formFPatientDeclarationName: document.getElementById('patientName') ? document.getElementById('patientName').value : '',
            formFPatientId: document.getElementById('patientId') ? document.getElementById('patientId').value : '',
            formFPatientAge: document.getElementById('maternalAge') ? document.getElementById('maternalAge').value : '',
            formFLmp: document.getElementById('lmp') ? document.getElementById('lmp').value : '',
            formFScanDate: document.getElementById('scanDate') ? document.getElementById('scanDate').value : '',
            formFDeclarationDate: document.getElementById('scanDate') ? document.getElementById('scanDate').value : '',
            formFResultConveyedOn: document.getElementById('scanDate') ? document.getElementById('scanDate').value : '',
            formFGaWeeks: ntGa.days != null ? String(Math.floor(ntGa.days / 7)) : '',
            formFGaDays: ntGa.days != null ? String(ntGa.days % 7) : '',
            formFReferredBy: document.getElementById('referringDoctor') ? document.getElementById('referringDoctor').value : '',
            formFSelfReferral: document.getElementById('referringDoctor') && document.getElementById('referringDoctor').value ? '' : consultantName,
            formFProcedureType: 'NT scan ultrasound',
            formFIndication: document.getElementById('indication') ? document.getElementById('indication').value : '',
            formFClinicalSummary: getCollapsedText('rImpression') || getCollapsedText('rRecommendation') || ''
          });
        }

        if (activeTab === 'level2') {
          return Object.assign({}, common, {
            formFLinkedReportPublicId: getCollapsedText('l2ReportId'),
            formFPatientName: document.getElementById('l2PatientName') ? document.getElementById('l2PatientName').value : '',
            formFPatientDeclarationName: document.getElementById('l2PatientName') ? document.getElementById('l2PatientName').value : '',
            formFPatientId: document.getElementById('l2PatientId') ? document.getElementById('l2PatientId').value : '',
            formFPatientAge: document.getElementById('l2MaternalAge') ? document.getElementById('l2MaternalAge').value : '',
            formFLmp: '',
            formFScanDate: document.getElementById('l2ScanDate') ? document.getElementById('l2ScanDate').value : '',
            formFDeclarationDate: document.getElementById('l2ScanDate') ? document.getElementById('l2ScanDate').value : '',
            formFResultConveyedOn: document.getElementById('l2ScanDate') ? document.getElementById('l2ScanDate').value : '',
            formFGaWeeks: document.getElementById('l2GaWeeks') ? document.getElementById('l2GaWeeks').value : '',
            formFGaDays: document.getElementById('l2GaDays') ? document.getElementById('l2GaDays').value : '',
            formFReferredBy: document.getElementById('l2ReferringDoctor') ? document.getElementById('l2ReferringDoctor').value : '',
            formFSelfReferral: document.getElementById('l2ReferringDoctor') && document.getElementById('l2ReferringDoctor').value ? '' : consultantName,
            formFProcedureType: 'Level II anomaly scan ultrasound',
            formFIndication: document.getElementById('l2Indication') ? document.getElementById('l2Indication').value : '',
            formFClinicalSummary: getCollapsedText('rl2Impression') || getCollapsedText('rl2Recommendation') || ''
          });
        }

        if (activeTab === 'biometry') {
          return Object.assign({}, common, {
            formFLinkedReportPublicId: getCollapsedText('bReportId'),
            formFPatientName: document.getElementById('bPatientName') ? document.getElementById('bPatientName').value : '',
            formFPatientDeclarationName: document.getElementById('bPatientName') ? document.getElementById('bPatientName').value : '',
            formFPatientId: document.getElementById('bPatientId') ? document.getElementById('bPatientId').value : '',
            formFPatientAge: document.getElementById('bMaternalAge') ? document.getElementById('bMaternalAge').value : '',
            formFLmp: '',
            formFScanDate: document.getElementById('bScanDate') ? document.getElementById('bScanDate').value : '',
            formFDeclarationDate: document.getElementById('bScanDate') ? document.getElementById('bScanDate').value : '',
            formFResultConveyedOn: document.getElementById('bScanDate') ? document.getElementById('bScanDate').value : '',
            formFGaWeeks: document.getElementById('bGaWeeks') ? document.getElementById('bGaWeeks').value : '',
            formFGaDays: document.getElementById('bGaDays') ? document.getElementById('bGaDays').value : '',
            formFReferredBy: document.getElementById('bReferringDoctor') ? document.getElementById('bReferringDoctor').value : '',
            formFSelfReferral: document.getElementById('bReferringDoctor') && document.getElementById('bReferringDoctor').value ? '' : consultantName,
            formFProcedureType: 'Routine fetal biometry ultrasound',
            formFIndication: document.getElementById('bIndication') ? document.getElementById('bIndication').value : '',
            formFClinicalSummary: getCollapsedText('rbImpression') || getCollapsedText('rbRecommendation') || ''
          });
        }

        if (activeTab === 'obdoppler') {
          return Object.assign({}, common, {
            formFLinkedReportPublicId: getCollapsedText('oReportId'),
            formFPatientName: document.getElementById('oPatientName') ? document.getElementById('oPatientName').value : '',
            formFPatientDeclarationName: document.getElementById('oPatientName') ? document.getElementById('oPatientName').value : '',
            formFPatientId: document.getElementById('oPatientId') ? document.getElementById('oPatientId').value : '',
            formFPatientAge: document.getElementById('oMaternalAge') ? document.getElementById('oMaternalAge').value : '',
            formFLmp: '',
            formFScanDate: document.getElementById('oScanDate') ? document.getElementById('oScanDate').value : '',
            formFDeclarationDate: document.getElementById('oScanDate') ? document.getElementById('oScanDate').value : '',
            formFResultConveyedOn: document.getElementById('oScanDate') ? document.getElementById('oScanDate').value : '',
            formFGaWeeks: document.getElementById('oGaWeeks') ? document.getElementById('oGaWeeks').value : '',
            formFGaDays: document.getElementById('oGaDays') ? document.getElementById('oGaDays').value : '',
            formFReferredBy: document.getElementById('oReferringDoctor') ? document.getElementById('oReferringDoctor').value : '',
            formFSelfReferral: document.getElementById('oReferringDoctor') && document.getElementById('oReferringDoctor').value ? '' : consultantName,
            formFProcedureType: 'Obstetric Doppler ultrasound',
            formFIndication: document.getElementById('oIndication') ? document.getElementById('oIndication').value : '',
            formFClinicalSummary: getCollapsedText('roImpression') || getCollapsedText('roRecommendation') || ''
          });
        }

        return Object.assign({}, common, {
          formFLinkedReportPublicId: getCollapsedText('tReportId'),
          formFPatientName: document.getElementById('tPatientName') ? document.getElementById('tPatientName').value : '',
          formFPatientDeclarationName: document.getElementById('tPatientName') ? document.getElementById('tPatientName').value : '',
          formFPatientId: document.getElementById('tPatientId') ? document.getElementById('tPatientId').value : '',
          formFPatientAge: document.getElementById('tMaternalAge') ? document.getElementById('tMaternalAge').value : '',
          formFLmp: '',
          formFScanDate: document.getElementById('tScanDate') ? document.getElementById('tScanDate').value : '',
          formFDeclarationDate: document.getElementById('tScanDate') ? document.getElementById('tScanDate').value : '',
          formFResultConveyedOn: document.getElementById('tScanDate') ? document.getElementById('tScanDate').value : '',
          formFGaWeeks: document.getElementById('tGaWeeks') ? document.getElementById('tGaWeeks').value : '',
          formFGaDays: document.getElementById('tGaDays') ? document.getElementById('tGaDays').value : '',
          formFReferredBy: document.getElementById('tReferringDoctor') ? document.getElementById('tReferringDoctor').value : '',
          formFSelfReferral: document.getElementById('tReferringDoctor') && document.getElementById('tReferringDoctor').value ? '' : consultantName,
          formFProcedureType: 'Twin pregnancy ultrasound',
          formFIndication: document.getElementById('tIndication') ? document.getElementById('tIndication').value : '',
          formFClinicalSummary: getCollapsedText('rtImpression') || getCollapsedText('rtRecommendation') || ''
        });
      }
      function autofillFormFFromCurrentCase() {
        var nextData = Object.assign({}, serializeFormFWorkspace(), getActiveCaseAutofill());
        if (!nextData.formFTotalLivingChildren) nextData.formFTotalLivingChildren = String(Number(nextData.formFMaleChildren || 0) + Number(nextData.formFFemaleChildren || 0));
        if (!nextData.formFLivingSonsDetail) nextData.formFLivingSonsDetail = String(nextData.formFMaleChildren || 0);
        if (!nextData.formFLivingDaughtersDetail) nextData.formFLivingDaughtersDetail = String(nextData.formFFemaleChildren || 0);
        restoreFormFWorkspace(nextData);
        setHtml('formFCurrentInfo', 'Form F workspace auto-filled from the active <strong>' + escapeHtml(getActiveTabName()) + '</strong> case using the English statutory layout. Review any remaining demographic / declaration fields and save when ready.');
      }
      function setFormFBox(id, checked) {
        var el = document.getElementById(id);
        if (el) el.textContent = checked ? '✓' : '';
      }
      function getFormFIndicationFlags(data) {
        var summary = String((data.formFClinicalSummary || '') + ' ' + (data.formFIndication || '') + ' ' + (data.formFProcedureType || '')).toLowerCase();
        var linked = String(data.formFLinkedReportPublicId || '').toLowerCase();
        var isNt = linked.indexOf('-nt-') !== -1 || summary.indexOf('nt scan') !== -1 || summary.indexOf('first trimester') !== -1;
        var isLevel2 = linked.indexOf('-l2-') !== -1 || summary.indexOf('level ii') !== -1 || summary.indexOf('anomaly scan') !== -1;
        var isBiometry = linked.indexOf('-bio-') !== -1 || summary.indexOf('biometry') !== -1 || summary.indexOf('growth') !== -1;
        var isDoppler = linked.indexOf('-obd-') !== -1 || summary.indexOf('doppler') !== -1;
        var isTwins = linked.indexOf('-twin-') !== -1 || summary.indexOf('twin') !== -1 || summary.indexOf('chorionicity') !== -1;
        return {
          1: isNt,
          2: !!(data.formFGaWeeks || data.formFGaDays || data.formFLmp),
          3: isTwins,
          4: summary.indexOf('iucd') !== -1 || summary.indexOf('contraceptive') !== -1 || summary.indexOf('mtp failure') !== -1,
          5: summary.indexOf('bleeding') !== -1 || summary.indexOf('leaking') !== -1,
          6: summary.indexOf('abortion') !== -1,
          7: summary.indexOf('cervix') !== -1 || summary.indexOf('internal os') !== -1,
          8: summary.indexOf('discordance') !== -1 || summary.indexOf('size') !== -1,
          9: summary.indexOf('uterine pathology') !== -1 || summary.indexOf('adnexal') !== -1,
          10: isLevel2 || summary.indexOf('structural') !== -1 || summary.indexOf('anomaly') !== -1 || summary.indexOf('chromosomal') !== -1,
          11: isLevel2 || isBiometry || isDoppler || isTwins || summary.indexOf('presentation') !== -1 || summary.indexOf('position') !== -1,
          12: isLevel2 || isBiometry || isDoppler || isTwins || summary.indexOf('liquor') !== -1,
          13: summary.indexOf('preterm') !== -1 || summary.indexOf('pprom') !== -1,
          14: isLevel2 || isBiometry || isDoppler || isTwins || summary.indexOf('placenta') !== -1,
          15: isLevel2 || summary.indexOf('umbilical cord') !== -1,
          16: summary.indexOf('caesarean') !== -1 || summary.indexOf('cesarean') !== -1 || summary.indexOf('scar') !== -1,
          17: isLevel2 || isBiometry || isDoppler || isTwins || summary.indexOf('fetal weight') !== -1,
          18: isDoppler || summary.indexOf('doppler') !== -1,
          19: summary.indexOf('external cephalic') !== -1 || summary.indexOf('termination') !== -1,
          20: summary.indexOf('cvs') !== -1 || summary.indexOf('amniocentesis') !== -1,
          21: summary.indexOf('intra-partum') !== -1,
          22: summary.indexOf('medical') !== -1 || summary.indexOf('surgical') !== -1 || summary.indexOf('complicating') !== -1,
          23: summary.indexOf('research') !== -1 || summary.indexOf('scientific') !== -1
        };
      }
      function updateFormFPrintable() {
        var data = serializeFormFWorkspace();
        var gaText = (data.formFGaWeeks || data.formFGaDays) ? String(data.formFGaWeeks || 0) + ' weeks ' + String(data.formFGaDays || 0) + ' days' : '-';
        var patientAgeText = data.formFPatientAge ? String(data.formFPatientAge) : '-';
        var centerAndAddress = [data.formFCentreName || '', data.formFClinicAddress || ''].filter(Boolean).join(', ');
        setText('ffRecordId', data.formFRecordId || 'Unsaved');
        setText('ffLinkedReportId', data.formFLinkedReportPublicId || '-');
        setText('ffStatus', data.formFStatus || 'Draft');
        setText('ffCentreAndAddress', centerAndAddress || '-');
        setText('ffClinicRegNo', data.formFClinicRegNo || data.formFConsultantReg || '-');
        setText('ffPatientNameInline', data.formFPatientName || '-');
        setText('ffPatientAgeInline', patientAgeText);
        setText('ffPatientName', data.formFPatientName || '-');
        setText('ffPatientId', data.formFPatientId || '-');
        setText('ffPatientAge', data.formFPatientAge ? String(data.formFPatientAge) + ' years' : '-');
        setText('ffTotalLivingChildren', data.formFTotalLivingChildren || String(Number(data.formFMaleChildren || 0) + Number(data.formFFemaleChildren || 0)) || '-');
        setText('ffLivingSonsDetail', data.formFLivingSonsDetail || data.formFMaleChildren || '-');
        setText('ffLivingDaughtersDetail', data.formFLivingDaughtersDetail || data.formFFemaleChildren || '-');
        setText('ffRelativeName', data.formFRelativeName || '-');
        setText('ffPatientAddress', data.formFPatientAddress || '-');
        setText('ffPatientPhone', data.formFPatientPhone || '-');
        setText('ffPatientAddressBlock', [data.formFPatientAddress || '', data.formFPatientPhone ? ('Contact: ' + data.formFPatientPhone) : ''].filter(Boolean).join(' | ') || '-');
        setText('ffReferredBy', data.formFReferredBy || '-');
        setText('ffReferredByLine', data.formFReferredBy || '-');
        setText('ffSelfReferral', data.formFSelfReferral || '-');
        setText('ffLmp', formatDate(data.formFLmp));
        setText('ffScanDate', formatDate(data.formFScanDate));
        setText('ffGa', gaText);
        setText('ffLmpOrWeeks', data.formFLmp ? (formatDate(data.formFLmp) + ' / ' + gaText) : gaText);
        setText('ffObstetricScore', 'G' + String(data.formFGravida || 0) + ' P' + String(data.formFPara || 0) + ' L' + String(data.formFLiving || 0) + ' A' + String(data.formFAbortions || 0));
        setText('ffMaleChildren', data.formFMaleChildren || '0');
        setText('ffFemaleChildren', data.formFFemaleChildren || '0');
        setText('ffDoctorName', data.formFDoctorName || data.formFConsultantName || '-');
        setText('ffReferralRegNo', data.formFReferralRegNo || '-');
        setText('ffProcedureType', data.formFProcedureType || '-');
        setText('ffProcedureOther', data.formFProcedureOther || '-');
        setText('ffIndication', data.formFIndication || '-');
        setText('ffIndicationInline', data.formFIndication || '-');
        setText('ffClinicalSummary', data.formFClinicalSummary || '-');
        setText('ffCentreName', data.formFCentreName || '-');
        setText('ffConsultantName', data.formFConsultantName || '-');
        setText('ffConsultantReg', data.formFConsultantReg || '-');
        setText('ffDeclaration', data.formFDeclaration || '-');
        setText('ffDeclarationDate', formatDate(data.formFDeclarationDate || data.formFScanDate));
        setText('ffProcedureDate', formatDate(data.formFScanDate));
        setText('ffResultConveyedTo', data.formFResultConveyedTo || '-');
        setText('ffResultConveyedOn', formatDate(data.formFResultConveyedOn || data.formFScanDate));
        setText('ffMtpIndication', data.formFMtpIndication || 'Nil / Not indicated');
        setText('ffDoctorDateBottom', formatDate(data.formFScanDate));
        setText('ffDoctorPlaceBottom', (document.getElementById('brandBranchName') ? document.getElementById('brandBranchName').value : '') || '-');
        setText('ffConsultantSignLine', ((data.formFConsultantName || '-') + ' | ' + (data.formFConsultantReg || '-')).trim());
        setText('ffPatientDeclarationName', data.formFPatientDeclarationName || data.formFPatientName || '-');
        setText('ffPatientDeclarationProcedure', data.formFPatientDeclarationProcedure || 'ultrasonography / image scanning');
        setText('ffPatientDeclDate', formatDate(data.formFDeclarationDate || data.formFScanDate));
        setText('ffDoctorDeclarationName', data.formFConsultantName || data.formFDoctorName || '-');
        setText('ffDoctorDeclarationPatient', data.formFPatientName || '-');
        setText('ffDoctorDeclarationDate', formatDate(data.formFScanDate));
        setText('ffDoctorDeclarationSignLine', ((data.formFConsultantName || '-') + ' | ' + (data.formFConsultantReg || '-')).trim());
        var flags = getFormFIndicationFlags(data);
        for (var i = 1; i <= 23; i += 1) setFormFBox('ffInd' + i, !!flags[i]);
        setFormFBox('ffProcUltrasound', true);
        setText('ffGeneratedAt', formatNowStamp());
        renderFinalizeValidationBox();
      }
      function renderSavedFormFs() {
        var forms = getSavedFormFs().slice().sort(function(a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
        if (currentLoadedFormFId && !forms.some(function(item) { return item.id === currentLoadedFormFId; })) {
          currentLoadedFormFId = null;
          updateCurrentFormFInfo(null);
        }
        if (!forms.length) {
          setHtml('formFSavedList', '<div class="saved-report-item"><div class="saved-report-sub">No Form F records saved yet in the current center / branch scope.</div></div>');
          renderComplianceDashboard();
          return;
        }
        setHtml('formFSavedList', forms.map(function(form) {
          var tone = form.status === 'Final' ? 'badge-green' : 'badge-amber';
          var scanText = form.data && form.data.formFScanDate ? formatDate(form.data.formFScanDate) : formatDate(form.updatedAt);
          var procedure = form.data && form.data.formFProcedureType ? form.data.formFProcedureType : '-';
          return '<div class="saved-report-item"><div class="saved-report-item-header"><div><div class="saved-report-title">' + escapeHtml(form.patientName || 'Unnamed patient') + '</div><div class="saved-report-sub">' + escapeHtml(form.id) + ' • ' + escapeHtml(form.linkedReportPublicId || '-') + '</div></div><div>' + makeBadge(form.status || 'Draft', tone) + '</div></div><div class="saved-report-sub">Scan: ' + escapeHtml(scanText) + ' • Procedure: ' + escapeHtml(procedure) + '</div><div class="saved-report-actions"><button class="mini-btn" data-formf-action="load" data-formf-id="' + escapeHtml(form.id) + '">Load</button><button class="mini-btn" data-formf-action="print" data-formf-id="' + escapeHtml(form.id) + '">Print</button><button class="mini-btn" data-formf-action="delete" data-formf-id="' + escapeHtml(form.id) + '">Delete</button></div></div>';
        }).join(''));
        renderComplianceDashboard();
      }
      function createNewFormF() {
        var data = serializeFormFWorkspace();
        var forms = getSavedFormFs();
        var now = new Date().toISOString();
        var record = {
          id: '',
          linkedReportStorageId: data.formFLinkedReportStorageId || currentLoadedReportId || '',
          linkedReportPublicId: data.formFLinkedReportPublicId || getReportDisplayId(getActiveTabName()),
          patientName: data.formFPatientName || 'Unnamed Patient',
          patientId: data.formFPatientId || 'No ID',
          status: data.formFStatus || 'Draft',
          createdAt: now,
          updatedAt: now,
          data: data
        };
        assignFormFSerialMeta(record, forms);
        record.data.formFRecordId = record.id;
        forms.push(record);
        persistSavedFormFs(forms);
        currentLoadedFormFId = record.id;
        setFormFFieldValue('formFRecordId', record.id);
        updateFormFPrintable();
        renderSavedFormFs();
        updateCurrentFormFInfo(record);
      }
      function updateCurrentFormF() {
        if (!currentLoadedFormFId) {
          createNewFormF();
          return;
        }
        var forms = getSavedFormFs();
        var record = forms.find(function(item) { return item.id === currentLoadedFormFId; });
        if (!record) {
          createNewFormF();
          return;
        }
        var data = serializeFormFWorkspace();
        record.linkedReportStorageId = data.formFLinkedReportStorageId || currentLoadedReportId || '';
        record.linkedReportPublicId = data.formFLinkedReportPublicId || getReportDisplayId(getActiveTabName());
        record.patientName = data.formFPatientName || 'Unnamed Patient';
        record.patientId = data.formFPatientId || 'No ID';
        record.status = data.formFStatus || 'Draft';
        record.updatedAt = new Date().toISOString();
        record.data = Object.assign({}, data, { formFRecordId: record.id });
        persistSavedFormFs(forms);
        setFormFFieldValue('formFRecordId', record.id);
        updateFormFPrintable();
        renderSavedFormFs();
        updateCurrentFormFInfo(record);
      }
      function loadSavedFormF(formId) {
        var record = getSavedFormFs().find(function(item) { return item.id === formId; });
        if (!record) return;
        currentLoadedFormFId = record.id;
        restoreFormFWorkspace(record.data || {});
        updateCurrentFormFInfo(record);
      }
      function deleteSavedFormF(formId) {
        var forms = getSavedFormFs().filter(function(item) { return item.id !== formId; });
        persistSavedFormFs(forms);
        if (currentLoadedFormFId === formId) clearFormFWorkspace();
        renderSavedFormFs();
      }
      function printFormFWorkspace() {
        updateFormFPrintable();
        document.body.classList.add('print-formf-only');
        window.print();
        window.setTimeout(function() {
          document.body.classList.remove('print-formf-only');
        }, 800);
      }
      function getScopedReceptionStorageKey() {
        var session = getActiveCenterSession();
        var centerId = session && session.centerId ? session.centerId : 'guest';
        var branchId = session && session.branchId ? session.branchId : 'default';
        return RECEPTION_STORAGE_KEY_PREFIX + '__' + centerId + '__' + branchId;
      }
      function getSavedReceptionEntries() {
        try {
          var parsed = JSON.parse(localStorage.getItem(getScopedReceptionStorageKey()) || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
          return [];
        }
      }
      function persistSavedReceptionEntries(entries) {
        localStorage.setItem(getScopedReceptionStorageKey(), JSON.stringify(entries));
        queueAutoSyncScope('reception-save');
      }
      function makeUniqueReceptionId() {
        return 'REC-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      }
      function getReceptionScanLabel(scanType) {
        return { nt: 'NT Scan', level2: 'Level II Scan', biometry: 'Routine Biometry', obdoppler: 'Obstetric + Doppler', twins: 'Twins' }[scanType] || 'Scan';
      }
      function getReceptionQueueTone(status) {
        if (status === 'delivered' || status === 'reported') return 'badge-green';
        if (status === 'cancelled') return 'badge-red';
        if (status === 'booked' || status === 'waiting' || status === 'in_progress' || status === 'scanned') return 'badge-amber';
        return 'badge-green';
      }
      function getReceptionPaymentTone(status) {
        if (status === 'paid' || status === 'waived') return 'badge-green';
        if (status === 'partial') return 'badge-amber';
        return 'badge-red';
      }
      function getNextReceptionDaySequence(dateValue, entries) {
        var dateKey = String(dateValue || new Date().toISOString().slice(0, 10));
        var scoped = (entries || []).filter(function(item) { return String(item.appointmentDate || '') === dateKey; });
        return scoped.length + 1;
      }
      function buildReceptionTokenNo(dateValue, sequence) {
        var dateKey = String(dateValue || new Date().toISOString().slice(0, 10)).split('-').join('');
        return getBranchSerialCode() + '-TK-' + dateKey + '-' + padSerial(sequence, 3);
      }
      function buildReceptionReceiptNo(dateValue, sequence) {
        var prefix = sanitizeSerialCode($('brandReportPrefix')?.value || 'FMU', 4);
        var dateKey = String(dateValue || new Date().toISOString().slice(0, 10)).split('-').join('');
        return prefix + '-' + getBranchSerialCode() + '-RC-' + dateKey + '-' + padSerial(sequence, 3);
      }
      function readReceptionWorkspace() {
        return {
          id: $('receptionRecordId')?.value || '',
          tokenNo: $('receptionTokenNo')?.value || '',
          receiptNo: $('receptionReceiptNo')?.value || '',
          patientName: ($('receptionPatientName')?.value || '').trim(),
          patientId: ($('receptionPatientId')?.value || '').trim(),
          age: $('receptionAge')?.value || '',
          phone: ($('receptionPhone')?.value || '').trim(),
          relativeName: ($('receptionRelativeName')?.value || '').trim(),
          appointmentDate: $('receptionAppointmentDate')?.value || new Date().toISOString().slice(0, 10),
          scanType: $('receptionScanType')?.value || 'nt',
          queueStatus: $('receptionQueueStatus')?.value || 'booked',
          paymentStatus: $('receptionPaymentStatus')?.value || 'unpaid',
          amount: $('receptionAmount')?.value || '0',
          amountPaid: $('receptionAmountPaid')?.value || '0',
          balance: $('receptionBalance')?.value || '0',
          referringDoctor: ($('receptionReferringDoctor')?.value || '').trim(),
          address: ($('receptionAddress')?.value || '').trim(),
          indication: ($('receptionIndication')?.value || '').trim(),
          notes: ($('receptionNotes')?.value || '').trim(),
          linkedReportId: '',
          linkedReportPublicId: ''
        };
      }
      function getNormalizedReceptionData(raw) {
        var data = Object.assign({}, raw || {});
        var amount = Number(data.amount || 0);
        var amountPaid = Number(data.amountPaid || 0);
        var balance = Math.max(0, amount - amountPaid);
        data.amount = amount.toFixed(2);
        data.amountPaid = amountPaid.toFixed(2);
        data.balance = balance.toFixed(2);
        if (data.paymentStatus !== 'waived') {
          if (amount <= 0 && amountPaid <= 0) data.paymentStatus = 'unpaid';
          else if (amountPaid >= amount && amount > 0) data.paymentStatus = 'paid';
          else if (amountPaid > 0) data.paymentStatus = 'partial';
          else data.paymentStatus = 'unpaid';
        }
        return data;
      }
      function restoreReceptionWorkspace(raw) {
        var data = getNormalizedReceptionData(raw || {});
        setFormFFieldValue('receptionRecordId', data.id || '');
        setFormFFieldValue('receptionTokenNo', data.tokenNo || '');
        setFormFFieldValue('receptionReceiptNo', data.receiptNo || '');
        setFormFFieldValue('receptionPatientName', data.patientName || '');
        setFormFFieldValue('receptionPatientId', data.patientId || '');
        setFormFFieldValue('receptionAge', data.age || '');
        setFormFFieldValue('receptionPhone', data.phone || '');
        setFormFFieldValue('receptionRelativeName', data.relativeName || '');
        setFormFFieldValue('receptionAppointmentDate', data.appointmentDate || new Date().toISOString().slice(0, 10));
        setFormFFieldValue('receptionScanType', data.scanType || 'nt');
        setFormFFieldValue('receptionQueueStatus', data.queueStatus || 'booked');
        setFormFFieldValue('receptionPaymentStatus', data.paymentStatus || 'unpaid');
        setFormFFieldValue('receptionAmount', data.amount || '0.00');
        setFormFFieldValue('receptionAmountPaid', data.amountPaid || '0.00');
        setFormFFieldValue('receptionBalance', data.balance || '0.00');
        setFormFFieldValue('receptionReferringDoctor', data.referringDoctor || '');
        setFormFFieldValue('receptionAddress', data.address || '');
        setFormFFieldValue('receptionIndication', data.indication || '');
        setFormFFieldValue('receptionNotes', data.notes || '');
      }
      function updateReceptionPaymentDerivedFields() {
        var data = getNormalizedReceptionData(readReceptionWorkspace());
        setFormFFieldValue('receptionAmount', data.amount);
        setFormFFieldValue('receptionAmountPaid', data.amountPaid);
        setFormFFieldValue('receptionBalance', data.balance);
        if ($('receptionPaymentStatus')) $('receptionPaymentStatus').value = data.paymentStatus || 'unpaid';
      }
      function updateCurrentReceptionInfo(record) {
        if (!record) {
          setHtml('receptionCurrentInfo', 'No reception entry loaded yet. Register the patient, assign the scan type, and open the case directly into the reporting tab.');
          return;
        }
        setHtml('receptionCurrentInfo', '<div><strong>Reception entry:</strong> ' + escapeHtml(record.id || '-') + '</div><div><strong>Token:</strong> ' + escapeHtml(record.tokenNo || '-') + ' • <strong>Receipt:</strong> ' + escapeHtml(record.receiptNo || '-') + '</div><div><strong>Patient:</strong> ' + escapeHtml(record.patientName || '-') + ' (' + escapeHtml(record.patientId || '-') + ')</div><div><strong>Queue:</strong> ' + escapeHtml(record.queueStatus || '-') + ' • <strong>Payment:</strong> ' + escapeHtml(record.paymentStatus || '-') + ' • <strong>Balance:</strong> ₹' + escapeHtml(String(record.balance || '0.00')) + '</div><div><strong>Linked report:</strong> ' + escapeHtml(record.linkedReportPublicId || '-') + '</div>');
      }
      function clearReceptionWorkspace() {
        currentLoadedReceptionId = null;
        restoreReceptionWorkspace({
          id: '',
          tokenNo: '',
          receiptNo: '',
          patientName: '',
          patientId: '',
          age: '',
          phone: '',
          relativeName: '',
          appointmentDate: new Date().toISOString().slice(0, 10),
          scanType: 'nt',
          queueStatus: 'booked',
          paymentStatus: 'unpaid',
          amount: '0.00',
          amountPaid: '0.00',
          balance: '0.00',
          referringDoctor: '',
          address: '',
          indication: '',
          notes: ''
        });
        updateCurrentReceptionInfo(null);
      }
      function getFilteredReceptionEntries() {
        var search = String($('receptionSearch')?.value || '').trim().toLowerCase();
        var status = String($('receptionStatusFilter')?.value || '').trim().toLowerCase();
        return getSavedReceptionEntries().slice().filter(function(item) {
          if (status && String(item.queueStatus || '').toLowerCase() !== status) return false;
          if (!search) return true;
          var haystack = [item.patientName, item.patientId, item.tokenNo, item.receiptNo, item.referringDoctor, item.indication, item.scanType, item.queueStatus].map(function(value) { return String(value || '').toLowerCase(); }).join(' ');
          return haystack.indexOf(search) !== -1;
        }).sort(function(a, b) {
          return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
        });
      }
      function renderReceptionDashboard() {
        var summary = $('receptionDashboardSummary');
        var grid = $('receptionDashboardGrid');
        if (!summary || !grid) return;
        var entries = getSavedReceptionEntries();
        var today = new Date().toISOString().slice(0, 10);
        var todayEntries = entries.filter(function(item) { return String(item.appointmentDate || '') === today; });
        var total = entries.length;
        var booked = entries.filter(function(item) { return item.queueStatus === 'booked'; }).length;
        var waiting = entries.filter(function(item) { return item.queueStatus === 'waiting'; }).length;
        var inProgress = entries.filter(function(item) { return item.queueStatus === 'in_progress'; }).length;
        var reported = entries.filter(function(item) { return item.queueStatus === 'reported'; }).length;
        var delivered = entries.filter(function(item) { return item.queueStatus === 'delivered'; }).length;
        var todayAmount = todayEntries.reduce(function(sum, item) { return sum + Number(item.amount || 0); }, 0);
        var todayCollected = todayEntries.reduce(function(sum, item) { return sum + Number(item.amountPaid || 0); }, 0);
        var todayBalance = todayEntries.reduce(function(sum, item) { return sum + Number(item.balance || 0); }, 0);
        setHtml('receptionDashboardSummary', '<strong>' + escapeHtml(getCurrentScopeLabel()) + '</strong> has <strong>' + escapeHtml(String(total)) + '</strong> registered reception entry / entries, with <strong>' + escapeHtml(String(todayEntries.length)) + '</strong> scheduled for today (' + escapeHtml(formatDate(today)) + ').');
        var chips = [
          ['Booked', booked],
          ['Waiting', waiting],
          ['In progress', inProgress],
          ['Reported', reported],
          ['Delivered', delivered],
          ['Today billed', '₹' + todayAmount.toFixed(2)],
          ['Today collected', '₹' + todayCollected.toFixed(2)],
          ['Today balance', '₹' + todayBalance.toFixed(2)]
        ];
        setHtml('receptionDashboardGrid', chips.map(function(pair) { return '<div class="monthly-report-chip"><strong>' + escapeHtml(pair[0]) + '</strong>' + escapeHtml(String(pair[1])) + '</div>'; }).join(''));
      }
      function renderReceptionQueueList() {
        var host = $('receptionQueueList');
        if (!host) return;
        var entries = getFilteredReceptionEntries();
        if (!entries.length) {
          setHtml('receptionQueueList', '<div class="saved-report-item"><div class="saved-report-sub">No reception entry found for the current search / filter in this center / branch scope.</div></div>');
          return;
        }
        setHtml('receptionQueueList', entries.map(function(item) {
          var queueBadge = makeBadge(titleCase(String(item.queueStatus || '').replace(/_/g, ' ')), getReceptionQueueTone(item.queueStatus));
          var payBadge = makeBadge(titleCase(String(item.paymentStatus || '').replace(/_/g, ' ')), getReceptionPaymentTone(item.paymentStatus));
          var receiptMeta = 'Amount: ₹' + escapeHtml(String(item.amount || '0.00')) + ' • Paid: ₹' + escapeHtml(String(item.amountPaid || '0.00')) + ' • Balance: ₹' + escapeHtml(String(item.balance || '0.00'));
          return '<div class="saved-report-item"><div class="saved-report-item-header"><div><div class="saved-report-title">' + escapeHtml(item.patientName || 'Unnamed patient') + ' • ' + escapeHtml(item.tokenNo || '-') + '</div><div class="saved-report-sub">' + escapeHtml(item.patientId || 'No ID') + ' • ' + escapeHtml(getReceptionScanLabel(item.scanType)) + ' • ' + escapeHtml(formatDate(item.appointmentDate)) + '</div></div><div>' + queueBadge + '</div></div><div class="reception-chip-row"><span class="timeline-chip">' + escapeHtml(item.receiptNo || '-') + '</span><span class="timeline-chip">' + escapeHtml(item.referringDoctor || 'No referrer') + '</span><span class="timeline-chip">' + escapeHtml(receiptMeta) + '</span></div><div class="saved-report-sub" style="margin-top:8px;">Payment: ' + payBadge + ' • Linked report: ' + escapeHtml(item.linkedReportPublicId || '-') + '</div><div class="saved-report-sub">' + escapeHtml(item.indication || '-') + '</div><div class="saved-report-actions"><button class="mini-btn" data-reception-action="load" data-reception-id="' + escapeHtml(item.id) + '">Load</button><button class="mini-btn" data-reception-action="open-case" data-reception-id="' + escapeHtml(item.id) + '">Open Case</button><button class="mini-btn" data-reception-action="waiting" data-reception-id="' + escapeHtml(item.id) + '">Mark Waiting</button><button class="mini-btn" data-reception-action="delivered" data-reception-id="' + escapeHtml(item.id) + '">Mark Delivered</button><button class="mini-btn" data-reception-action="print" data-reception-id="' + escapeHtml(item.id) + '">Print Receipt</button></div></div>';
        }).join(''));
      }
      function renderReceptionDesk() {
        var current = currentLoadedReceptionId ? getSavedReceptionEntries().find(function(item) { return item.id === currentLoadedReceptionId; }) || null : null;
        renderReceptionDashboard();
        renderReceptionQueueList();
        updateCurrentReceptionInfo(current);
      }
      function createReceptionEntry() {
        var base = getNormalizedReceptionData(readReceptionWorkspace());
        if (!base.patientName) {
          setHtml('receptionCurrentInfo', 'Patient name is required before saving the reception register entry.');
          return null;
        }
        var entries = getSavedReceptionEntries();
        var sequence = getNextReceptionDaySequence(base.appointmentDate, entries);
        var now = new Date().toISOString();
        var record = Object.assign({}, base, {
          id: makeUniqueReceptionId(),
          tokenNo: buildReceptionTokenNo(base.appointmentDate, sequence),
          receiptNo: buildReceptionReceiptNo(base.appointmentDate, sequence),
          linkedReportId: '',
          linkedReportPublicId: '',
          createdAt: now,
          updatedAt: now
        });
        entries.push(record);
        persistSavedReceptionEntries(entries);
        currentLoadedReceptionId = record.id;
        restoreReceptionWorkspace(record);
        renderReceptionDesk();
        return record;
      }
      function updateCurrentReceptionEntry() {
        if (!currentLoadedReceptionId) {
          createReceptionEntry();
          return;
        }
        var entries = getSavedReceptionEntries();
        var record = entries.find(function(item) { return item.id === currentLoadedReceptionId; });
        if (!record) {
          createReceptionEntry();
          return;
        }
        var data = getNormalizedReceptionData(readReceptionWorkspace());
        Object.assign(record, data, {
          id: record.id,
          tokenNo: record.tokenNo,
          receiptNo: record.receiptNo,
          linkedReportId: record.linkedReportId || '',
          linkedReportPublicId: record.linkedReportPublicId || '',
          createdAt: record.createdAt,
          updatedAt: new Date().toISOString()
        });
        persistSavedReceptionEntries(entries);
        restoreReceptionWorkspace(record);
        renderReceptionDesk();
      }
      function loadReceptionEntry(entryId) {
        var record = getSavedReceptionEntries().find(function(item) { return item.id === entryId; });
        if (!record) return;
        currentLoadedReceptionId = record.id;
        restoreReceptionWorkspace(record);
        renderReceptionDesk();
      }
      function updateReceptionQueueStatus(entryId, status) {
        var entries = getSavedReceptionEntries();
        var record = entries.find(function(item) { return item.id === entryId; });
        if (!record) return;
        record.queueStatus = status;
        record.updatedAt = new Date().toISOString();
        persistSavedReceptionEntries(entries);
        if (currentLoadedReceptionId === entryId) restoreReceptionWorkspace(record);
        renderReceptionDesk();
      }
      function getReceptionRecordForCaseOpen() {
        if (currentLoadedReceptionId) {
          return getSavedReceptionEntries().find(function(item) { return item.id === currentLoadedReceptionId; }) || null;
        }
        return null;
      }
      function openReceptionCase() {
        var record = getReceptionRecordForCaseOpen();
        if (!record) record = createReceptionEntry();
        if (!record) return;
        var targetTab = record.scanType || 'nt';
        currentLoadedReportId = null;
        currentEditMode = 'normal';
        switchTab(targetTab);
        restoreTabToDefaults(targetTab);
        var patientMap = getPatientFieldMapByTab(targetTab);
        if ($(patientMap.nameId)) $(patientMap.nameId).value = record.patientName || '';
        if ($(patientMap.idId)) $(patientMap.idId).value = record.patientId || '';
        if ($(patientMap.ageId) && record.age) $(patientMap.ageId).value = record.age;
        var visitMap = getVisitMetaFieldMap(targetTab);
        if ($(visitMap.scanDate)) $(visitMap.scanDate).value = record.appointmentDate || new Date().toISOString().slice(0, 10);
        if ($(visitMap.doctor)) $(visitMap.doctor).value = record.referringDoctor || '';
        if ($(visitMap.indication)) $(visitMap.indication).value = record.indication || '';
        if ($('workspaceReportTitle')) $('workspaceReportTitle').value = getSuggestedReportTitle(targetTab, { patientName: record.patientName || 'Unnamed Patient', patientId: record.patientId || 'No ID' });
        if ($('workspaceVersionNote')) $('workspaceVersionNote').value = 'Opened from reception token ' + (record.tokenNo || '-');
        if (record.queueStatus === 'booked' || record.queueStatus === 'waiting') updateReceptionQueueStatus(record.id, 'in_progress');
        var recalcMap = { nt: calculateAll, level2: calculateLevel2, biometry: calculateBiometry, obdoppler: calculateObDoppler, twins: calculateTwins };
        (recalcMap[targetTab] || calculateAll)();
      }
      function buildReceptionReceiptHtml(record) {
        var clinic = ($('brandClinicName') && $('brandClinicName').value ? $('brandClinicName').value.trim() : '') || 'Fetal Medicine & Ultrasound Centre';
        var branch = ($('brandBranchName') && $('brandBranchName').value ? $('brandBranchName').value.trim() : '') || 'Main Branch';
        var address = ($('brandAddress') && $('brandAddress').value ? $('brandAddress').value.trim() : '') || '-';
        var contact = ($('brandContact') && $('brandContact').value ? $('brandContact').value.trim() : '') || '-';
        var consultant = ($('brandConsultant') && $('brandConsultant').value ? $('brandConsultant').value.trim() : '') || 'Dr Consultant Name';
        return '<!DOCTYPE html><html><head><title>Reception Receipt</title><style>body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111827;} .box{max-width:760px;margin:0 auto;border:1px solid #dbe3f0;border-radius:16px;padding:24px;} h1{margin:0 0 6px;font-size:24px;color:#16375b;} .sub{color:#475569;font-size:13px;line-height:1.6;} table{width:100%;border-collapse:collapse;margin-top:18px;font-size:13px;} td,th{border:1px solid #dbe3f0;padding:8px 10px;text-align:left;} th{background:#f8fbff;} .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;} .chip{border:1px solid #dbe3f0;border-radius:12px;padding:10px 12px;background:#fff;}</style></head><body><div class="box"><h1>' + escapeHtml(clinic) + '</h1><div class="sub">' + escapeHtml(branch) + '<br>' + escapeHtml(address) + '<br>' + escapeHtml(contact) + '</div><div class="meta"><div class="chip"><strong>Receipt No.</strong><br>' + escapeHtml(record.receiptNo || '-') + '</div><div class="chip"><strong>Token</strong><br>' + escapeHtml(record.tokenNo || '-') + '</div><div class="chip"><strong>Date</strong><br>' + escapeHtml(formatDate(record.appointmentDate || record.createdAt)) + '</div></div><table><tr><th>Patient name</th><td>' + escapeHtml(record.patientName || '-') + '</td><th>UHID</th><td>' + escapeHtml(record.patientId || '-') + '</td></tr><tr><th>Age</th><td>' + escapeHtml(String(record.age || '-')) + '</td><th>Phone</th><td>' + escapeHtml(record.phone || '-') + '</td></tr><tr><th>Relative</th><td>' + escapeHtml(record.relativeName || '-') + '</td><th>Requested study</th><td>' + escapeHtml(getReceptionScanLabel(record.scanType)) + '</td></tr><tr><th>Referring doctor</th><td>' + escapeHtml(record.referringDoctor || '-') + '</td><th>Queue status</th><td>' + escapeHtml(titleCase(String(record.queueStatus || '').replace(/_/g, ' '))) + '</td></tr><tr><th>Amount</th><td>Rs ' + escapeHtml(String(record.amount || '0.00')) + '</td><th>Amount paid</th><td>Rs ' + escapeHtml(String(record.amountPaid || '0.00')) + '</td></tr><tr><th>Balance</th><td>Rs ' + escapeHtml(String(record.balance || '0.00')) + '</td><th>Payment status</th><td>' + escapeHtml(titleCase(String(record.paymentStatus || '').replace(/_/g, ' '))) + '</td></tr><tr><th>Indication / note</th><td colspan="3">' + escapeHtml(record.indication || record.notes || '-') + '</td></tr></table><div class="sub" style="margin-top:18px;">Receipt generated from the center front-desk workflow. Consultant / center reference: ' + escapeHtml(consultant) + '.</div></div><script>
(function () {
  const ADMIN_ROLE_VALUES = ['admin', 'administrator', 'owner', 'superadmin', 'super_admin', 'platform_admin', 'platformadmin', 'saas_admin', 'saasadmin'];
  const CLINIC_STEP_MAP = {
    'clinic-registry': ['centerAccessCard'],
    'patient-registry': ['receptionBillingCard', 'patientMasterCard'],
    'examinations': ['examTabsBar', 'panel-nt', 'panel-level2', 'panel-biometry', 'panel-obdoppler', 'panel-twins'],
    'report-preview': ['reportWorkspaceCard'],
    'formf-automation': ['complianceCard', 'formFCard', 'printable-formf']
  };
  const ADMIN_STEP_MAP = {
    'admin-console': ['superAdminConsoleCard'],
    'admin-backend': ['backendIntegrationCard']
  };
  const MANAGED_SECTION_IDS = Array.from(new Set([
    'supabaseAuthCard',
    ...Object.values(CLINIC_STEP_MAP).flat(),
    ...Object.values(ADMIN_STEP_MAP).flat()
  ]));
  const ALL_CLINIC_SECTIONS = Array.from(new Set(Object.values(CLINIC_STEP_MAP).flat()));
  const ALL_ADMIN_SECTIONS = Array.from(new Set(Object.values(ADMIN_STEP_MAP).flat()));

  function $(id) { return document.getElementById(id); }
  function show(el, visible) { if (el) el.style.display = visible ? '' : 'none'; }
  function text(el, value) { if (el) el.textContent = value; }
  function html(el, value) { if (el) el.innerHTML = value; }
  function pick(source, candidates) {
    if (!source || typeof source !== 'object') return '';
    for (const candidate of candidates) {
      if (!candidate) continue;
      const path = candidate.split('.');
      let current = source;
      let ok = true;
      for (const key of path) {
        if (current && typeof current === 'object' && key in current) current = current[key];
        else { ok = false; break; }
      }
      if (ok && current != null && String(current).trim()) return String(current).trim();
    }
    return '';
  }
  function localNameFromEmail(email) {
    return (email || '').split('@')[0] || 'Center User';
  }
  function domainTokenFromEmail(email) {
    return ((email || '').split('@')[1] || '').split('.')[0] || '';
  }
  function readUserContext(user) {
    const userMeta = user?.user_metadata || {};
    const appMeta = user?.app_metadata || {};
    const roleRaw = (pick(userMeta, ['role', 'app_role', 'user_role', 'userType', 'user_type', 'type', 'profile.role']) || pick(appMeta, ['role', 'app_role', 'user_role', 'type', 'profile.role']) || '').toLowerCase();
    const route = ADMIN_ROLE_VALUES.includes(roleRaw) ? 'admin' : 'clinic';
    const centerId = pick(userMeta, ['centre_id', 'center_id', 'centreId', 'centerId', 'clinic_id', 'clinicId', 'tenant_id', 'tenantId', 'center.id', 'centre.id', 'clinic.id', 'tenant.id', 'branch.center_id', 'branch.centre_id']) ||
      pick(appMeta, ['centre_id', 'center_id', 'centreId', 'centerId', 'clinic_id', 'clinicId', 'tenant_id', 'tenantId', 'center.id', 'centre.id', 'clinic.id', 'tenant.id']);
    const centerName = pick(userMeta, ['centre_name', 'center_name', 'centreName', 'centerName', 'clinic_name', 'clinicName', 'tenant_name', 'tenantName', 'center.name', 'centre.name', 'clinic.name', 'tenant.name']) ||
      pick(appMeta, ['centre_name', 'center_name', 'centreName', 'centerName', 'clinic_name', 'clinicName', 'tenant_name', 'tenantName', 'center.name', 'centre.name', 'clinic.name', 'tenant.name']);
    const branchId = pick(userMeta, ['branch_id', 'branchId', 'branch.id']);
    const branchName = pick(userMeta, ['branch_name', 'branchName', 'branch.name']);
    const centerPassword = pick(userMeta, ['center_password', 'centre_password', 'clinic_password', 'center.password', 'centre.password', 'clinic.password']) || 'demo123';
    const ownerPin = pick(userMeta, ['owner_pin', 'ownerPin']) || 'owner123';
    const displayName = pick(userMeta, ['full_name', 'display_name', 'displayName', 'name']) || pick(appMeta, ['full_name', 'display_name', 'displayName', 'name']) || localNameFromEmail(user?.email);
    return { route, role: roleRaw || 'clinic_user', centerId, centerName, branchId, branchName, centerPassword, ownerPin, displayName };
  }
  function setStatus(message, isError) {
    const boot = $('saasBootStatus');
    const route = $('saasRouteStatus');
    const legacy = $('authStatus');
    if (boot) {
      boot.classList.toggle('error', !!isError);
      html(boot, message);
    }
    if (route) {
      route.classList.toggle('error', !!isError);
      html(route, message);
    }
    if (legacy) {
      legacy.style.color = isError ? '#b42318' : '#334155';
      legacy.innerHTML = message;
    }
  }
  function syncBootFieldsToLegacy() {
    const bootEmail = $('saasBootEmail')?.value || '';
    const bootPassword = $('saasBootPassword')?.value || '';
    if ($('authEmail')) $('authEmail').value = bootEmail;
    if ($('authPassword')) $('authPassword').value = bootPassword;
  }
  function activateStepButtons(step, adminMode) {
    const selector = adminMode ? '#saasAdminStepper .saas-stepper-btn' : '#saasClinicStepper .saas-stepper-btn';
    document.querySelectorAll(selector).forEach((btn) => btn.classList.toggle('active', btn.dataset.saasStep === step));
  }
  function showSectionIds(idsToShow) {
    const keep = new Set(idsToShow);
    MANAGED_SECTION_IDS.forEach((id) => {
      const node = $(id);
      if (!node) return;
      show(node, keep.has(id));
    });
  }
  function updateTopbar(ctx, user) {
    const routeBadge = $('saasRouteBadge');
    const currentUserChip = $('saasCurrentUserChip');
    const title = $('saasWorkspaceTitle');
    const subtitle = $('saasWorkspaceSubtitle');
    if (!routeBadge || !currentUserChip || !title || !subtitle) return;
    routeBadge.textContent = ctx.route === 'admin' ? 'Administrator Console' : 'Clinic Workspace';
    routeBadge.classList.toggle('admin', ctx.route === 'admin');
    routeBadge.classList.toggle('clinic', ctx.route !== 'admin');
    if (ctx.route === 'admin') {
      title.textContent = 'Platform Administrator Console';
      subtitle.textContent = 'Center registry, backend bridge, remote controls, and multicentre platform management.';
    } else {
      title.textContent = 'Clinic Reporting Workspace';
      subtitle.textContent = 'Clinic registry, patient registry, examination tabs, report preview, and Form F automation.';
    }
    currentUserChip.innerHTML = '<strong>' + (ctx.displayName || localNameFromEmail(user?.email)) + '</strong><br/>' + (user?.email || '-') + (ctx.centerName || ctx.centerId ? '<br/>Center: ' + (ctx.centerName || ctx.centerId) : '');
  }
  function updateStage(kicker, heading, summary) {
    text($('saasStageKicker'), kicker);
    text($('saasStageHeading'), heading);
    text($('saasStageSummary'), summary);
  }
  function setRouteLayout(route) {
    document.body.classList.add('saas-route-active');
    document.body.classList.remove('saas-auth-pending');
    document.body.dataset.saasRoute = route;
    if ($('saasMainContainer')) {
      $('saasMainContainer').style.display = '';
      $('saasMainContainer').dataset.saasRoute = route;
    }
    show($('saasBootScreen'), false);
    show($('saasAppChrome'), true);
    show($('supabaseAuthCard'), false);
    if ($('saasClinicStepper')) $('saasClinicStepper').hidden = route === 'admin';
    if ($('saasAdminStepper')) $('saasAdminStepper').hidden = route !== 'admin';
  }
  async function autoUnlockAdmin(ctx) {
    if ($('superAdminUserName')) $('superAdminUserName').value = ctx.displayName || 'Platform Owner';
    if ($('superAdminPin')) $('superAdminPin').value = ctx.ownerPin || 'owner123';
    $('superAdminUnlockBtn')?.click();
  }
  function getCenterOptionHints(ctx, user) {
    const values = [];
    [ctx.centerId, ctx.centerName, localNameFromEmail(user?.email), domainTokenFromEmail(user?.email)].forEach((value) => {
      if (value && !values.includes(value)) values.push(value);
    });
    return values;
  }
  function findMatchingCenterOption(select, hints) {
    const options = Array.from(select?.options || []);
    for (const hint of hints) {
      const normalizedHint = String(hint).trim().toLowerCase();
      const exact = options.find((opt) => String(opt.value || '').trim().toLowerCase() === normalizedHint || String(opt.textContent || '').trim().toLowerCase() === normalizedHint);
      if (exact) return exact;
      const partial = options.find((opt) => String(opt.value || '').toLowerCase().includes(normalizedHint) || String(opt.textContent || '').toLowerCase().includes(normalizedHint));
      if (partial) return partial;
    }
    return null;
  }
  async function autoMapClinicSession(ctx, user) {
    const select = $('centerLoginSelect');
    if (!select) return { ok: false, reason: 'Center selector is unavailable in the current page.' };
    for (let attempt = 0; attempt < 8 && !(select.options || []).length; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    const option = findMatchingCenterOption(select, getCenterOptionHints(ctx, user));
    if (!option) {
      return { ok: false, reason: 'Authenticated, but center mapping could not be created from the current user metadata. Open Clinic Registry and choose the center once.' };
    }
    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    if ($('centerUserName')) $('centerUserName').value = ctx.displayName || localNameFromEmail(user?.email);
    if ($('centerRoleSelect') && ctx.role) $('centerRoleSelect').value = ['admin', 'consultant', 'sonologist', 'viewer'].includes(ctx.role) ? ctx.role : 'admin';
    if ($('centerPassword')) $('centerPassword').value = ctx.centerPassword || 'demo123';
    $('centerLoginBtn')?.click();
    await new Promise((resolve) => setTimeout(resolve, 160));
    if (ctx.branchId && $('centerBranchSelector')) {
      const branchSelect = $('centerBranchSelector');
      const match = Array.from(branchSelect.options || []).find((opt) => opt.value === ctx.branchId || String(opt.textContent || '').trim().toLowerCase() === String(ctx.branchName || '').trim().toLowerCase());
      if (match) {
        branchSelect.value = match.value;
        branchSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    return { ok: true, centerLabel: option.textContent || option.value };
  }
  function showClinicStep(step) {
    const ids = CLINIC_STEP_MAP[step] || CLINIC_STEP_MAP['clinic-registry'];
    showSectionIds(ids);
    activateStepButtons(step, false);
    const labels = {
      'clinic-registry': ['Clinic Registry', 'Confirm center scope, branch scope, branding, consultant sign-off, and current clinic session.'],
      'patient-registry': ['Patient Registry', 'Register the case, review prior visits, manage reception / billing data, and open the active patient timeline.'],
      'examinations': ['Examination Tabs', 'Complete the selected scan tab and let the existing reporting logic calculate the structured findings.'],
      'report-preview': ['Report Preview', 'Save, amend, archive, and finalize the generated report preview for the active examination.'],
      'formf-automation': ['PCPNDT / Form F Automation', 'Verify mandatory PCPNDT details, linked Form F fields, and the print-ready statutory preview.']
    };
    updateStage('Clinic workflow', labels[step][0], labels[step][1]);
    const anchor = ids.map((id) => $(id)).find(Boolean);
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function showAdminStep(step) {
    const ids = ADMIN_STEP_MAP[step] || ADMIN_STEP_MAP['admin-console'];
    showSectionIds(ids);
    activateStepButtons(step, true);
    const labels = {
      'admin-console': ['Administrator Console', 'Manage centers, subscriptions, feature toggles, KYC state, and platform-level summary from the owner workspace.'],
      'admin-backend': ['Backend Bridge', 'Control sync mode, API endpoint, auth token, and remote hydration / push settings for the multicentre app.']
    };
    updateStage('Administrator route', labels[step][0], labels[step][1]);
    const anchor = ids.map((id) => $(id)).find(Boolean);
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  async function applyUserRoute(user) {
    const ctx = readUserContext(user);
    updateTopbar(ctx, user);
    setRouteLayout(ctx.route);
    if (ctx.route === 'admin') {
      await autoUnlockAdmin(ctx);
      setStatus('Administrator session loaded from Supabase role mapping.', false);
      showAdminStep('admin-console');
    } else {
      const autoMapResult = await autoMapClinicSession(ctx, user);
      setStatus(autoMapResult.ok
        ? 'Clinic workspace loaded for <strong>' + (ctx.centerName || autoMapResult.centerLabel || ctx.centerId || user?.email || 'current user') + '</strong>. Start with Clinic Registry, then move through the workflow steps.'
        : autoMapResult.reason, !autoMapResult.ok);
      showClinicStep('clinic-registry');
    }
  }
  function resetToBoot() {
    document.body.classList.add('saas-auth-pending');
    document.body.classList.remove('saas-route-active');
    delete document.body.dataset.saasRoute;
    if ($('saasMainContainer')) $('saasMainContainer').style.display = 'none';
    show($('saasAppChrome'), false);
    show($('saasBootScreen'), true);
    setStatus('Waiting for sign-in.', false);
  }
  async function bootAuth(mode) {
    syncBootFieldsToLegacy();
    setStatus(mode === 'signup' ? 'Creating account…' : 'Signing in…', false);
    try {
      if (mode === 'signup') await signUpUser();
      else await signInUser();
      const user = typeof getCurrentSupabaseUser === 'function' ? await getCurrentSupabaseUser() : null;
      if (user) await applyUserRoute(user);
      else if (mode !== 'signup') setStatus($('authStatus')?.innerHTML || 'Login did not complete.', true);
      else setStatus($('authStatus')?.innerHTML || 'Signup request submitted.', false);
    } catch (error) {
      setStatus(error?.message || 'Authentication failed.', true);
    }
  }
  async function logoutEverywhere() {
    try {
      $('centerLogoutBtn')?.click();
      $('superAdminLockBtn')?.click();
      if (typeof signOutUser === 'function') await signOutUser();
    } catch (_) {}
    resetToBoot();
  }
  function wireButtons() {
    $('saasBootLoginBtn')?.addEventListener('click', () => bootAuth('login'));
    $('saasBootSignUpBtn')?.addEventListener('click', () => bootAuth('signup'));
    $('saasTopbarLogoutBtn')?.addEventListener('click', logoutEverywhere);
    document.querySelectorAll('#saasClinicStepper .saas-stepper-btn').forEach((btn) => btn.addEventListener('click', () => showClinicStep(btn.dataset.saasStep)));
    document.querySelectorAll('#saasAdminStepper .saas-stepper-btn').forEach((btn) => btn.addEventListener('click', () => showAdminStep(btn.dataset.saasStep)));
  }
  document.addEventListener('DOMContentLoaded', async function () {
    wireButtons();
    resetToBoot();
    try {
      const client = typeof createSupabaseClientIfPossible === 'function' ? createSupabaseClientIfPossible() : null;
      client?.auth?.onAuthStateChange?.(async function (_event, session) {
        if (session?.user) await applyUserRoute(session.user);
        else resetToBoot();
      });
      const existingUser = typeof getCurrentSupabaseUser === 'function' ? await getCurrentSupabaseUser() : null;
      if (existingUser) await applyUserRoute(existingUser);
    } catch (error) {
      setStatus(error?.message || 'Supabase session initialization failed.', true);
    }
  });
})();



  const supabaseUrl = "https://vqncwpgtkellxkncwunk.supabase.co";
  const supabaseKey = "sb_publishable_LFiqeWCar0j7ZSPy8qWlGg_BonlarTt";
  let supabaseClient = null;

  function createSupabaseClientIfPossible() {
    const supabaseLib = window.supabase || window.supabaseJs || globalThis.supabase || globalThis.supabaseJs;
    const hasConfig = supabaseUrl && supabaseKey && !supabaseUrl.includes("YOUR_URL_HERE") && !supabaseKey.includes("YOUR_ANON_KEY_HERE") && !supabaseKey.includes("PASTE_YOUR_ANON_KEY_HERE");
    if (!hasConfig) return null;
    if (!supabaseLib || typeof supabaseLib.createClient !== 'function') return null;
    if (supabaseClient) return supabaseClient;
    try {
      supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);
      return supabaseClient;
    } catch (err) {
      console.error('Supabase client init failed:', err);
      return null;
    }
  }

  function setAuthStatus(message, isError = false) {
    const el = document.getElementById('authStatus');
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? '#b42318' : '#334155';
  }

  async function refreshSupabaseAuthStatus() {
    const client = createSupabaseClientIfPossible();
    if (!client) {
      setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
      return null;
    }
    const { data, error } = await client.auth.getUser();
    if (error) {
      setAuthStatus(error.message, true);
      return null;
    }
    const user = data?.user || null;
    if (user) {
      const centreHint = user.user_metadata?.centre_id || user.id;
      setAuthStatus(`Logged in as ${user.email} • Centre scope: ${centreHint}`);
    } else {
      setAuthStatus('Not logged in.');
    }
    return user;
  }

  async function signUpUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
    const email = (document.getElementById('authEmail')?.value || '').trim();
    const password = (document.getElementById('authPassword')?.value || '').trim();
    if (!email || !password) return setAuthStatus('Enter email and password.', true);
    const { error } = await client.auth.signUp({ email, password });
    if (error) return setAuthStatus(error.message, true);
    setAuthStatus('Signup successful. Check email if confirmation is enabled.');
  }

  async function signInUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
    const email = (document.getElementById('authEmail')?.value || '').trim();
    const password = (document.getElementById('authPassword')?.value || '').trim();
    if (!email || !password) return setAuthStatus('Enter email and password.', true);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return setAuthStatus(error.message, true);
    await refreshSupabaseAuthStatus();
  }

  async function signOutUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
    const { error } = await client.auth.signOut();
    if (error) return setAuthStatus(error.message, true);
    await refreshSupabaseAuthStatus();
  }

  async function getCurrentSupabaseUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data?.user || null;
  }

  async function requireSupabaseAuth() {
    const user = await getCurrentSupabaseUser();
    if (!user) {
      setAuthStatus('Please login first to create or update reports.', true);
      alert('Please login first.');
      return null;
    }
    return user;
  }

  function deriveCentreIdFromUser(user) {
    return user?.user_metadata?.centre_id || user?.id || 'guest';
  }

  function stampLatestSavedReport(user) {
    if (!user || typeof getSavedReports !== 'function' || typeof persistSavedReports !== 'function') return;
    const reports = getSavedReports();
    if (!Array.isArray(reports) || !reports.length) return;
    const report = reports.find((item) => item.id === window.currentLoadedReportId) || reports[reports.length - 1];
    if (!report) return;
    report.user_id = user.id;
    report.user_email = user.email || '';
    report.centre_id = deriveCentreIdFromUser(user);
    report.updatedAt = new Date().toISOString();
    persistSavedReports(reports);
  }

  async function syncLatestReportToSupabase(user) {
    if (!supabaseClient || !user || typeof getSavedReports !== 'function') return;
    const reports = getSavedReports();
    const report = reports.find((item) => item.id === window.currentLoadedReportId) || reports[reports.length - 1];
    if (!report) return;
    const payload = {
      app_report_id: report.id,
      title: report.title || '',
      patient_name: report.patientName || '',
      patient_id: report.patientId || '',
      report_type: report.reportType || '',
      status: report.status || 'Draft',
      centre_id: deriveCentreIdFromUser(user),
      user_id: user.id,
      updated_at: new Date().toISOString(),
      payload_json: report
    };
    try {
      const { error } = await supabaseClient.from('reports').upsert([payload], { onConflict: 'app_report_id' });
      if (error) {
        console.warn('Supabase sync skipped:', error.message);
        setAuthStatus(`Logged in as ${user.email}. Local save worked, remote sync needs a matching reports table.`, true);
      }
    } catch (err) {
      console.warn('Supabase sync failed:', err);
    }
  }

  function wireSupabaseAuthButtons() {
    const signUpBtn = document.getElementById('supabaseSignUpBtn');
    const loginBtn = document.getElementById('supabaseLoginBtn');
    const logoutBtn = document.getElementById('supabaseLogoutBtn');
    if (signUpBtn) signUpBtn.addEventListener('click', signUpUser);
    if (loginBtn) loginBtn.addEventListener('click', signInUser);
    if (logoutBtn) logoutBtn.addEventListener('click', signOutUser);
  }

  function patchReportActionsForSupabaseAuth() {
    if (typeof window.createNewReport === 'function' && !window.__supabaseCreatePatched) {
      const originalCreate = window.createNewReport;
      window.createNewReport = async function(initialStatus = 'Draft') {
        const user = await requireSupabaseAuth();
        if (!user) return;
        const result = originalCreate.apply(this, arguments);
        stampLatestSavedReport(user);
        await syncLatestReportToSupabase(user);
        return result;
      };
      window.__supabaseCreatePatched = true;
    }

    if (typeof window.appendVersionToCurrent === 'function' && !window.__supabaseAppendPatched) {
      const originalAppend = window.appendVersionToCurrent;
      window.appendVersionToCurrent = async function(mode = 'update') {
        const user = await requireSupabaseAuth();
        if (!user) return;
        const result = originalAppend.apply(this, arguments);
        stampLatestSavedReport(user);
        await syncLatestReportToSupabase(user);
        return result;
      };
      window.__supabaseAppendPatched = true;
    }
  }

  document.addEventListener('DOMContentLoaded', async function() {
    wireSupabaseAuthButtons();
    patchReportActionsForSupabaseAuth();
    await refreshSupabaseAuthStatus();
  });



  const supabaseUrl = "https://vqncwpgtkellxkncwunk.supabase.co";
  const supabaseKey = "sb_publishable_LFiqeWCar0j7ZSPy8qWlGg_BonlarTt";
  let supabaseClient = null;

  function createSupabaseClientIfPossible() {
    const supabaseLib = window.supabase || window.supabaseJs || globalThis.supabase || globalThis.supabaseJs;
    const hasConfig = supabaseUrl && supabaseKey && !supabaseUrl.includes("YOUR_URL_HERE") && !supabaseKey.includes("YOUR_ANON_KEY_HERE") && !supabaseKey.includes("PASTE_YOUR_ANON_KEY_HERE");
    if (!hasConfig) return null;
    if (!supabaseLib || typeof supabaseLib.createClient !== 'function') return null;
    if (supabaseClient) return supabaseClient;
    try {
      supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);
      return supabaseClient;
    } catch (err) {
      console.error('Supabase client init failed:', err);
      return null;
    }
  }

  function setAuthStatus(message, isError = false) {
    const el = document.getElementById('authStatus');
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? '#b42318' : '#334155';
  }

  async function refreshSupabaseAuthStatus() {
    const client = createSupabaseClientIfPossible();
    if (!client) {
      setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
      return null;
    }
    const { data, error } = await client.auth.getUser();
    if (error) {
      setAuthStatus(error.message, true);
      return null;
    }
    const user = data?.user || null;
    if (user) {
      const centreHint = user.user_metadata?.centre_id || user.id;
      setAuthStatus(`Logged in as ${user.email} • Centre scope: ${centreHint}`);
    } else {
      setAuthStatus('Not logged in.');
    }
    return user;
  }

  async function signUpUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
    const email = (document.getElementById('authEmail')?.value || '').trim();
    const password = (document.getElementById('authPassword')?.value || '').trim();
    if (!email || !password) return setAuthStatus('Enter email and password.', true);
    const { error } = await client.auth.signUp({ email, password });
    if (error) return setAuthStatus(error.message, true);
    setAuthStatus('Signup successful. Check email if confirmation is enabled.');
  }

  async function signInUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
    const email = (document.getElementById('authEmail')?.value || '').trim();
    const password = (document.getElementById('authPassword')?.value || '').trim();
    if (!email || !password) return setAuthStatus('Enter email and password.', true);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return setAuthStatus(error.message, true);
    await refreshSupabaseAuthStatus();
  }

  async function signOutUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return setAuthStatus('Supabase library did not load. Use the hosted file or check internet/CDN access.', true);
    const { error } = await client.auth.signOut();
    if (error) return setAuthStatus(error.message, true);
    await refreshSupabaseAuthStatus();
  }

  async function getCurrentSupabaseUser() {
    const client = createSupabaseClientIfPossible();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data?.user || null;
  }

  async function requireSupabaseAuth() {
    const user = await getCurrentSupabaseUser();
    if (!user) {
      setAuthStatus('Please login first to create or update reports.', true);
      alert('Please login first.');
      return null;
    }
    return user;
  }

  function deriveCentreIdFromUser(user) {
    return user?.user_metadata?.centre_id || user?.id || 'guest';
  }

  function stampLatestSavedReport(user) {
    if (!user || typeof getSavedReports !== 'function' || typeof persistSavedReports !== 'function') return;
    const reports = getSavedReports();
    if (!Array.isArray(reports) || !reports.length) return;
    const report = reports.find((item) => item.id === window.currentLoadedReportId) || reports[reports.length - 1];
    if (!report) return;
    report.user_id = user.id;
    report.user_email = user.email || '';
    report.centre_id = deriveCentreIdFromUser(user);
    report.updatedAt = new Date().toISOString();
    persistSavedReports(reports);
  }

  async function syncLatestReportToSupabase(user) {
    if (!supabaseClient || !user || typeof getSavedReports !== 'function') return;
    const reports = getSavedReports();
    const report = reports.find((item) => item.id === window.currentLoadedReportId) || reports[reports.length - 1];
    if (!report) return;
    const payload = {
      app_report_id: report.id,
      title: report.title || '',
      patient_name: report.patientName || '',
      patient_id: report.patientId || '',
      report_type: report.reportType || '',
      status: report.status || 'Draft',
      centre_id: deriveCentreIdFromUser(user),
      user_id: user.id,
      updated_at: new Date().toISOString(),
      payload_json: report
    };
    try {
      const { error } = await supabaseClient.from('reports').upsert([payload], { onConflict: 'app_report_id' });
      if (error) {
        console.warn('Supabase sync skipped:', error.message);
        setAuthStatus(`Logged in as ${user.email}. Local save worked, remote sync needs a matching reports table.`, true);
      }
    } catch (err) {
      console.warn('Supabase sync failed:', err);
    }
  }

  function wireSupabaseAuthButtons() {
    const signUpBtn = document.getElementById('supabaseSignUpBtn');
    const loginBtn = document.getElementById('supabaseLoginBtn');
    const logoutBtn = document.getElementById('supabaseLogoutBtn');
    if (signUpBtn) signUpBtn.addEventListener('click', signUpUser);
    if (loginBtn) loginBtn.addEventListener('click', signInUser);
    if (logoutBtn) logoutBtn.addEventListener('click', signOutUser);
  }

  function patchReportActionsForSupabaseAuth() {
    if (typeof window.createNewReport === 'function' && !window.__supabaseCreatePatched) {
      const originalCreate = window.createNewReport;
      window.createNewReport = async function(initialStatus = 'Draft') {
        const user = await requireSupabaseAuth();
        if (!user) return;
        const result = originalCreate.apply(this, arguments);
        stampLatestSavedReport(user);
        await syncLatestReportToSupabase(user);
        return result;
      };
      window.__supabaseCreatePatched = true;
    }

    if (typeof window.appendVersionToCurrent === 'function' && !window.__supabaseAppendPatched) {
      const originalAppend = window.appendVersionToCurrent;
      window.appendVersionToCurrent = async function(mode = 'update') {
        const user = await requireSupabaseAuth();
        if (!user) return;
        const result = originalAppend.apply(this, arguments);
        stampLatestSavedReport(user);
        await syncLatestReportToSupabase(user);
        return result;
      };
      window.__supabaseAppendPatched = true;
    }
  }

  document.addEventListener('DOMContentLoaded', async function() {
    wireSupabaseAuthButtons();
    patchReportActionsForSupabaseAuth();
    await refreshSupabaseAuthStatus();
  });
