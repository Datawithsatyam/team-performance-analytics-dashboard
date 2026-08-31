function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Team Performance Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDashboardData(startDateStr, endDateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const excludedSheets = ['Call FLow Generic Guide', 'Dropdownitems'];

  let data = {
    global: {
      totals: { completed: 0, incomplete: 0, requeued: 0 },
      orgs: {},
      incompleteReasons: {},
      requeueReasons: {}
    },
    agents: {}
  };

  let start = startDateStr ? new Date(startDateStr).setHours(0,0,0,0) : null;
  let end = endDateStr ? new Date(endDateStr).setHours(23,59,59,999) : null;

  sheets.forEach(sheet => {
    const agentName = sheet.getName();
    if (excludedSheets.includes(agentName)) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const values = sheet.getRange(2, 3, lastRow - 1, 9).getValues();

    if (!data.agents[agentName]) {
      data.agents[agentName] = {
        totals: { completed: 0, incomplete: 0, requeued: 0 },
        orgs: {},
        incompleteReasons: {},
        requeueReasons: {}
      };
    }

    values.forEach(row => {
      const activity = row[1] ? row[1].toString() : '';
      if (!activity) return;

      const dateVal = row[8];
      if (start && end) {
        const rowDate = new Date(dateVal).getTime();
        if (isNaN(rowDate) || rowDate < start || rowDate > end) return;
      }

      const org = row[3] ? row[3].toString() : 'Unknown';
      const reason = row[0] ? row[0].toString() : 'No Reason Specified';

      let status = 'incomplete';
      if (activity.includes('Completed') || activity.includes('Success')) {
        status = 'completed';
      } else if (activity.includes('Requeued')) {
        status = 'requeued';
      }

      data.global.totals[status]++;
      if (!data.global.orgs[org]) {
        data.global.orgs[org] = { completed: 0, incomplete: 0, requeued: 0 };
      }
      data.global.orgs[org][status]++;

      if (status === 'incomplete') {
        data.global.incompleteReasons[reason] =
          (data.global.incompleteReasons[reason] || 0) + 1;
      }
      if (status === 'requeued') {
        data.global.requeueReasons[reason] =
          (data.global.requeueReasons[reason] || 0) + 1;
      }

      data.agents[agentName].totals[status]++;
      if (!data.agents[agentName].orgs[org]) {
        data.agents[agentName].orgs[org] = {
          completed: 0, incomplete: 0, requeued: 0
        };
      }
      data.agents[agentName].orgs[org][status]++;

      if (status === 'incomplete') {
        data.agents[agentName].incompleteReasons[reason] =
          (data.agents[agentName].incompleteReasons[reason] || 0) + 1;
      }
      if (status === 'requeued') {
        data.agents[agentName].requeueReasons[reason] =
          (data.agents[agentName].requeueReasons[reason] || 0) + 1;
      }
    });
  });

  return data;
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 My Dashboard')
      .addItem('Open Web App Dashboard', 'showDashboardLink')
      .addToUi();
}

function showDashboardLink() {
  // Keep the real URL only in your private Google Apps Script project.
  const webAppUrl = "YOUR_DEPLOYED_WEB_APP_URL";

  const html = HtmlService.createHtmlOutput(
    '<html><body style="font-family:sans-serif;text-align:center;margin-top:30px;">' +
    '<a href="' + webAppUrl + '" target="_blank" ' +
    'style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;' +
    'border-radius:6px;font-weight:bold;font-size:16px;">Open Dashboard</a>' +
    '</body></html>'
  ).setWidth(350).setHeight(150);

  SpreadsheetApp.getUi().showModalDialog(
    html,
    'Team Performance Dashboard'
  );
}

function getRawRows(startDateStr, endDateStr) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const excludedSheets = ['Call FLow Generic Guide', 'Dropdownitems'];
  const rows = [];

  const start = startDateStr
    ? new Date(startDateStr).setHours(0,0,0,0)
    : null;
  const end = endDateStr
    ? new Date(endDateStr).setHours(23,59,59,999)
    : null;

  sheets.forEach(sheet => {
    const agentName = sheet.getName();
    if (excludedSheets.includes(agentName)) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const values = sheet.getRange(2, 3, lastRow - 1, 10).getValues();

    values.forEach(row => {
      const activity = row[1] ? row[1].toString() : '';
      if (!activity) return;

      const rowDate = new Date(row[8]).getTime();
      if (start && end &&
          (isNaN(rowDate) || rowDate < start || rowDate > end)) return;

      let status = 'incomplete';
      if (activity.includes('Completed') || activity.includes('Success')) {
        status = 'completed';
      } else if (activity.includes('Requeued')) {
        status = 'requeued';
      }

      rows.push({
        agent: agentName,
        reason: row[0] ? row[0].toString() : 'No Reason Specified',
        org: row[3] ? row[3].toString() : 'Unknown',
        status: status,
        durationSec: parseDurationToSeconds(row[9])
      });
    });
  });

  return rows;
}

function parseDurationToSeconds(val) {
  if (val instanceof Date) {
    return val.getHours() * 3600 +
           val.getMinutes() * 60 +
           val.getSeconds();
  }

  if (typeof val === 'string' && val.includes(':')) {
    const p = val.split(':').map(Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    if (p.length === 2) return p[0] * 60 + p[1];
  }

  if (typeof val === 'number' && !isNaN(val)) {
    return val * 24 * 3600;
  }

  return null;
}

function runDailyChecks() {
  const todayStr = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );

  const rows = getRawRows(todayStr, todayStr);

  const INCOMPLETE_RATE_THRESHOLD = 0.30;
  const REASON_SPIKE_THRESHOLD = 3;
  const REQUEUE_COUNT_THRESHOLD = 2;
  const DURATION_LOW_SEC = 10;
  const DURATION_HIGH_SEC = 3600;

  const perAgent = {};

  rows.forEach(r => {
    if (!perAgent[r.agent]) {
      perAgent[r.agent] = {
        completed: 0,
        incomplete: 0,
        requeued: 0,
        reasons: {},
        durations: []
      };
    }

    const a = perAgent[r.agent];
    a[r.status]++;

    if (r.status !== 'completed') {
      a.reasons[r.reason] = (a.reasons[r.reason] || 0) + 1;
    }

    if (r.durationSec != null) {
      a.durations.push(r.durationSec);
    }
  });

  const alerts = [];

  Object.entries(perAgent).forEach(([agent, a]) => {
    const total = a.completed + a.incomplete + a.requeued;
    if (total === 0) return;

    const incompleteRate = a.incomplete / total;

    if (incompleteRate > INCOMPLETE_RATE_THRESHOLD) {
      alerts.push(
        `⚠️ ${agent}: incomplete rate ${(incompleteRate * 100).toFixed(0)}% (${a.incomplete}/${total})`
      );
    }

    Object.entries(a.reasons).forEach(([reason, count]) => {
      if (count >= REASON_SPIKE_THRESHOLD) {
        alerts.push(
          `⚠️ ${agent}: "${reason}" occurred ${count}x today`
        );
      }
    });

    if (a.requeued >= REQUEUE_COUNT_THRESHOLD) {
      alerts.push(`🔁 ${agent}: ${a.requeued} requeues today`);
    }

    const shortCalls = a.durations.filter(
      d => d < DURATION_LOW_SEC
    ).length;

    const longCalls = a.durations.filter(
      d => d > DURATION_HIGH_SEC
    ).length;

    if (shortCalls) {
      alerts.push(
        `⏱️ ${agent}: ${shortCalls} call(s) under ${DURATION_LOW_SEC}s`
      );
    }

    if (longCalls) {
      alerts.push(
        `⏱️ ${agent}: ${longCalls} call(s) over ${DURATION_HIGH_SEC / 60} min`
      );
    }
  });

  if (alerts.length > 0) {
    MailApp.sendEmail({
      to: "admin@demo-company.com",
      subject: `⚠️ Team Performance Alerts — ${todayStr}`,
      body: alerts.join('\n')
    });
  }

  return alerts;
}

function getTrendData(numDays) {
  numDays = numDays || 7;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const excludedSheets = ['Call FLow Generic Guide', 'Dropdownitems'];

  const startWindow = new Date();
  startWindow.setDate(startWindow.getDate() - (numDays - 1));
  startWindow.setHours(0,0,0,0);

  const buckets = {};
  const labels = [];

  for (let i = 0; i < numDays; i++) {
    const d = new Date(startWindow);
    d.setDate(d.getDate() + i);

    const key = Utilities.formatDate(
      d,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

    buckets[key] = {
      completed: 0,
      incomplete: 0,
      requeued: 0
    };

    labels.push(
      Utilities.formatDate(
        d,
        Session.getScriptTimeZone(),
        'MMM d'
      )
    );
  }

  const bucketKeys = Object.keys(buckets);

  sheets.forEach(sheet => {
    if (excludedSheets.includes(sheet.getName())) return;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    const values = sheet.getRange(2, 3, lastRow - 1, 9).getValues();

    values.forEach(row => {
      const activity = row[1] ? row[1].toString() : '';
      if (!activity) return;

      const d = new Date(row[8]);
      if (isNaN(d.getTime())) return;

      const key = Utilities.formatDate(
        d,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );

      if (!buckets[key]) return;

      let status = 'incomplete';
      if (activity.includes('Completed') || activity.includes('Success')) {
        status = 'completed';
      } else if (activity.includes('Requeued')) {
        status = 'requeued';
      }

      buckets[key][status]++;
    });
  });

  return {
    labels: labels,
    completed: bucketKeys.map(k => buckets[k].completed),
    incomplete: bucketKeys.map(k => buckets[k].incomplete),
    requeued: bucketKeys.map(k => buckets[k].requeued)
  };
}
