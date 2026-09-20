/*******************************************************
 * TEAM PERFORMANCE & OPERATIONAL ANALYTICS DASHBOARD
 * Google Apps Script Backend
 *
 * DATA STRUCTURE
 *
 * C = Incomplete Task Reasons
 * D = Activity
 * F = Organization / Product
 * I = Start Time
 * J = End Time
 * K = Date
 * L = Task Duration
 *******************************************************/

const CONFIG = {

  EXCLUDED_SHEETS: [
    'Call FLow Generic Guide',
    'Dropdownitems'
  ],

  DATA_START_ROW: 2,

  DATA_START_COLUMN: 3,

  DATA_COLUMN_COUNT: 10,

  /*
   * Daily target per agent.
   * Change this to your actual target.
   */
  DAILY_TARGET_PER_AGENT: 20,

  TREND_DAYS: 7,

  INCOMPLETE_RATE_THRESHOLD: 0.30,

  REQUEUE_COUNT_THRESHOLD: 2,

  REASON_SPIKE_THRESHOLD: 3,

  DURATION_LOW_SEC: 10,

  DURATION_HIGH_SEC: 3600

};


/*******************************************************
 * WEB APP
 *******************************************************/

function doGet() {

  return HtmlService
    .createHtmlOutputFromFile('Index')
    .setTitle('Team Performance Dashboard')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );

}


/*******************************************************
 * CUSTOM MENU
 *******************************************************/

function onOpen() {

  SpreadsheetApp
    .getUi()
    .createMenu('📊 My Dashboard')
    .addItem(
      'Open Web App Dashboard',
      'showDashboardLink'
    )
    .addToUi();

}


function showDashboardLink() {

  /*
   * Keep the real deployment URL in your private Apps Script.
   * Use the placeholder below in the public GitHub version.
   */
  const webAppUrl =
    'YOUR_DEPLOYED_WEB_APP_URL';

  const html = HtmlService.createHtmlOutput(`
    <html>
      <body style="
        font-family:Arial,sans-serif;
        text-align:center;
        margin-top:30px;
      ">

        <a
          href="${webAppUrl}"
          target="_blank"
          style="
            display:inline-block;
            background:#2563eb;
            color:white;
            padding:12px 24px;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
            font-size:16px;
          "
        >
          Open Dashboard
        </a>

      </body>
    </html>
  `)
    .setWidth(350)
    .setHeight(150);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'Team Performance Dashboard'
    );

}


/*******************************************************
 * DATE HELPERS
 *******************************************************/

function getDateKey(value) {

  if (!value) {
    return null;
  }

  let date;

  if (value instanceof Date) {
    date = value;
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );

}


function parseDateInput(
  dateString,
  endOfDay
) {

  if (!dateString) {
    return null;
  }

  const parts =
    dateString
      .split('-')
      .map(Number);

  if (parts.length !== 3) {
    return null;
  }

  const date = new Date(
    parts[0],
    parts[1] - 1,
    parts[2]
  );

  if (endOfDay) {

    date.setHours(
      23,
      59,
      59,
      999
    );

  } else {

    date.setHours(
      0,
      0,
      0,
      0
    );

  }

  return date;

}


function getTodayKey() {

  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );

}


/*******************************************************
 * STATUS CLASSIFICATION
 *******************************************************/

function classifyStatus(
  activity
) {

  if (!activity) {
    return null;
  }

  const text =
    activity
      .toString()
      .trim()
      .toLowerCase();

  if (!text) {
    return null;
  }

  if (
    text.includes('completed') ||
    text.includes('success')
  ) {

    return 'completed';

  }

  if (
    text.includes('requeued') ||
    text.includes('requeue')
  ) {

    return 'requeued';

  }

  return 'incomplete';

}


/*******************************************************
 * DURATION CONVERSION
 *******************************************************/

function parseDurationToSeconds(
  value
) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return null;

  }

  /*
   * Google Sheets duration may arrive as
   * a fraction of a day.
   */

  if (
    typeof value === 'number'
  ) {

    if (
      value >= 0 &&
      value < 1
    ) {

      return Math.round(
        value * 86400
      );

    }

    return value;

  }

  /*
   * Date object
   */

  if (
    value instanceof Date
  ) {

    return (
      value.getHours() * 3600 +
      value.getMinutes() * 60 +
      value.getSeconds()
    );

  }

  /*
   * HH:MM:SS
   * MM:SS
   */

  if (
    typeof value === 'string' &&
    value.includes(':')
  ) {

    const parts =
      value
        .split(':')
        .map(Number);

    if (
      parts.length === 3
    ) {

      return (
        parts[0] * 3600 +
        parts[1] * 60 +
        parts[2]
      );

    }

    if (
      parts.length === 2
    ) {

      return (
        parts[0] * 60 +
        parts[1]
      );

    }

  }

  return null;

}


/*******************************************************
 * EMPTY STATS
 *******************************************************/

function createStats() {

  return {

    totals: {

      completed: 0,
      incomplete: 0,
      requeued: 0

    },

    completed: 0,

    incomplete: 0,

    requeued: 0,

    total: 0,

    completionRate: 0,

    incompleteRate: 0,

    requeueRate: 0,

    totalDurationSec: 0,

    durationCount: 0,

    avgDurationSec: null,

    orgs: {},

    incompleteReasons: {},

    requeueReasons: {},

    daily: {}

  };

}


/*******************************************************
 * ADD RECORD TO STATS
 *******************************************************/

function addRecordToStats(
  stats,
  record
) {

  stats.totals[
    record.status
  ]++;

  stats[
    record.status
  ]++;

  stats.total++;

  /*
   * Organization
   */

  if (
    !stats.orgs[
      record.org
    ]
  ) {

    stats.orgs[
      record.org
    ] = {

      completed: 0,
      incomplete: 0,
      requeued: 0,
      total: 0

    };

  }

  stats.orgs[
    record.org
  ][
    record.status
  ]++;

  stats.orgs[
    record.org
  ].total++;


  /*
   * Incomplete reasons
   */

  if (
    record.status ===
    'incomplete'
  ) {

    stats.incompleteReasons[
      record.reason
    ] =
      (
        stats.incompleteReasons[
          record.reason
        ] || 0
      ) + 1;

  }


  /*
   * Requeue reasons
   */

  if (
    record.status ===
    'requeued'
  ) {

    stats.requeueReasons[
      record.reason
    ] =
      (
        stats.requeueReasons[
          record.reason
        ] || 0
      ) + 1;

  }


  /*
   * Duration
   */

  if (
    record.durationSec !== null &&
    !isNaN(
      record.durationSec
    )
  ) {

    stats.totalDurationSec +=
      record.durationSec;

    stats.durationCount++;

  }


  /*
   * Daily trend
   */

  if (
    !stats.daily[
      record.dateKey
    ]
  ) {

    stats.daily[
      record.dateKey
    ] = {

      completed: 0,
      incomplete: 0,
      requeued: 0,
      total: 0

    };

  }

  stats.daily[
    record.dateKey
  ][
    record.status
  ]++;

  stats.daily[
    record.dateKey
  ].total++;

}


/*******************************************************
 * FINALIZE STATS
 *******************************************************/

function finalizeStats(
  stats
) {

  if (
    stats.total > 0
  ) {

    stats.completionRate =
      stats.completed /
      stats.total;

    stats.incompleteRate =
      stats.incomplete /
      stats.total;

    stats.requeueRate =
      stats.requeued /
      stats.total;

  }


  if (
    stats.durationCount > 0
  ) {

    stats.avgDurationSec =
      stats.totalDurationSec /
      stats.durationCount;

  }


  stats.totals.completed =
    stats.completed;

  stats.totals.incomplete =
    stats.incomplete;

  stats.totals.requeued =
    stats.requeued;


  return stats;

}


/*******************************************************
 * READ ALL OPERATIONAL DATA
 *
 * Reads spreadsheet once.
 *******************************************************/

function readOperationalData() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheets =
    ss.getSheets();

  const records = [];


  sheets.forEach(
    sheet => {

      const agentName =
        sheet.getName();


      if (
        CONFIG
          .EXCLUDED_SHEETS
          .includes(
            agentName
          )
      ) {

        return;

      }


      const lastRow =
        sheet.getLastRow();


      if (
        lastRow <
        CONFIG.DATA_START_ROW
      ) {

        return;

      }


      /*
       * Read C:L once.
       */

      const values =
        sheet.getRange(
          CONFIG.DATA_START_ROW,
          CONFIG.DATA_START_COLUMN,
          lastRow -
            CONFIG.DATA_START_ROW +
            1,
          CONFIG.DATA_COLUMN_COUNT
        ).getValues();


      values.forEach(
        row => {

          /*
           * C:L
           *
           * row[0] = C = Reason
           * row[1] = D = Activity
           * row[2] = E = Role
           * row[3] = F = Organization
           * row[4] = G
           * row[5] = H
           * row[6] = I = Start
           * row[7] = J = End
           * row[8] = K = Date
           * row[9] = L = Duration
           */

          const activity =
            row[1]
              ? row[1]
                  .toString()
                  .trim()
              : '';


          if (!activity) {
            return;
          }


          const dateKey =
            getDateKey(
              row[8]
            );


          if (!dateKey) {
            return;
          }


          const status =
            classifyStatus(
              activity
            );


          if (!status) {
            return;
          }


          const organization =
            row[3]
              ? row[3]
                  .toString()
                  .trim()
              : 'Unknown';


          const reason =
            row[0]
              ? row[0]
                  .toString()
                  .trim()
              : 'No Reason Specified';


          const durationSec =
            parseDurationToSeconds(
              row[9]
            );


          records.push({

            agent:
              agentName,

            reason:
              reason,

            org:
              organization,

            status:
              status,

            dateKey:
              dateKey,

            durationSec:
              durationSec

          });

        }
      );

    }
  );


  return records;

}


/*******************************************************
 * FILTER RECORDS
 *******************************************************/

function filterRecords(
  records,
  startDateStr,
  endDateStr
) {

  if (
    !startDateStr &&
    !endDateStr
  ) {

    return records;

  }


  const start =
    parseDateInput(
      startDateStr,
      false
    );


  const end =
    parseDateInput(
      endDateStr,
      true
    );


  let startKey =
    null;

  let endKey =
    null;


  if (start) {

    startKey =
      Number(
        Utilities.formatDate(
          start,
          Session.getScriptTimeZone(),
          'yyyyMMdd'
        )
      );

  }


  if (end) {

    endKey =
      Number(
        Utilities.formatDate(
          end,
          Session.getScriptTimeZone(),
          'yyyyMMdd'
        )
      );

  }


  return records.filter(
    record => {

      const recordKey =
        Number(
          record.dateKey
            .replace(
              /-/g,
              ''
            )
        );


      if (
        startKey !== null &&
        recordKey <
        startKey
      ) {

        return false;

      }


      if (
        endKey !== null &&
        recordKey >
        endKey
      ) {

        return false;

      }


      return true;

    }
  );

}


/*******************************************************
 * TREND
 *******************************************************/

function buildTrendData(
  records,
  selectedAgent
) {

  if (
    !records ||
    records.length === 0
  ) {

    return {
      labels: [],
      completed: [],
      incomplete: [],
      requeued: []
    };

  }


  /*
   * Find latest date inside the currently
   * filtered dataset.
   *
   * This keeps the trend aligned with
   * the selected date range.
   */

  const sortedDates =
    records
      .map(r => r.dateKey)
      .filter(Boolean)
      .sort();


  const maxDateStr =
    sortedDates[
      sortedDates.length - 1
    ];


  const anchorDate =
    parseDateInput(
      maxDateStr,
      false
    ) || new Date();


  const buckets = {};
  const labels = [];
  const keys = [];


  for (
    let i =
      CONFIG.TREND_DAYS - 1;
    i >= 0;
    i--
  ) {

    const date =
      new Date(anchorDate);

    date.setDate(
      anchorDate.getDate() - i
    );


    const key =
      Utilities.formatDate(
        date,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );


    buckets[key] = {

      completed: 0,
      incomplete: 0,
      requeued: 0

    };


    keys.push(key);

    labels.push(
      Utilities.formatDate(
        date,
        Session.getScriptTimeZone(),
        'MMM d'
      )
    );

  }


  const filteredRecords =
    selectedAgent &&
    selectedAgent !== 'All'
      ? records.filter(
          r =>
            r.agent ===
            selectedAgent
        )
      : records;


  filteredRecords.forEach(
    record => {

      if (
        !buckets[
          record.dateKey
        ]
      ) {

        return;

      }


      buckets[
        record.dateKey
      ][
        record.status
      ]++;

    }
  );


  return {

    labels:
      labels,

    completed:
      keys.map(
        key =>
          buckets[key]
            .completed
      ),

    incomplete:
      keys.map(
        key =>
          buckets[key]
            .incomplete
      ),

    requeued:
      keys.map(
        key =>
          buckets[key]
            .requeued
      )

  };

}


/*******************************************************
 * TODAY STATS
 *******************************************************/

function buildTodayStats(
  records
) {

  const todayKey =
    getTodayKey();


  const team =
    createStats();


  const agents = {};


  records.forEach(
    record => {

      if (
        record.dateKey !==
        todayKey
      ) {

        return;

      }


      addRecordToStats(
        team,
        record
      );


      if (
        !agents[
          record.agent
        ]
      ) {

        agents[
          record.agent
        ] =
          createStats();

      }


      addRecordToStats(
        agents[
          record.agent
        ],
        record
      );

    }
  );


  finalizeStats(
    team
  );


  Object.values(
    agents
  ).forEach(
    stats =>
      finalizeStats(
        stats
      )
  );


  return {

    date:
      todayKey,

    team:
      team,

    agents:
      agents

  };

}


/*******************************************************
 * AGENT RANKINGS
 *******************************************************/

function buildAgentRankings(
  agents,
  todayAgents
) {

  return Object.entries(
    agents
  )

  .map(
    ([agent, stats]) => {

      const today =
        todayAgents[
          agent
        ] ||
        createStats();


      const completedToday =
        today.completed;


      const target =
        CONFIG
          .DAILY_TARGET_PER_AGENT;


      const attainment =
        target > 0

          ? completedToday /
            target

          : 0;


      let risk =
        'Low';


      if (
        stats.incompleteRate >
          CONFIG
            .INCOMPLETE_RATE_THRESHOLD ||
        stats.requeued >=
          CONFIG
            .REQUEUE_COUNT_THRESHOLD
      ) {

        risk =
          'High';

      }

      else if (
        stats.incompleteRate >
          0.15 ||
        stats.requeued > 0
      ) {

        risk =
          'Medium';

      }


      return {

        agent:
          agent,

        completed:
          stats.completed,

        incomplete:
          stats.incomplete,

        requeued:
          stats.requeued,

        total:
          stats.total,

        completionRate:
          stats.completionRate,

        incompleteRate:
          stats.incompleteRate,

        requeueRate:
          stats.requeueRate,

        completedToday:
          completedToday,

        target:
          target,

        targetAttainment:
          attainment,

        risk:
          risk

      };

    }
  )

  .sort(
    (a, b) =>
      b.completedToday -
      a.completedToday
  );

}


/*******************************************************
 * ALERT ENGINE
 *******************************************************/

function generateAlerts(
  agents
) {

  const alerts = [];


  Object.entries(
    agents
  ).forEach(
    ([agent, stats]) => {

      if (
        stats.total === 0
      ) {

        return;

      }


      /*
       * Incomplete rate
       */

      if (
        stats.incompleteRate >
        CONFIG
          .INCOMPLETE_RATE_THRESHOLD
      ) {

        alerts.push({

          severity:
            'high',

          type:
            'Incomplete Rate',

          agent:
            agent,

          message:
            `${agent} has a ${(stats.incompleteRate * 100).toFixed(1)}% incomplete rate (${stats.incomplete}/${stats.total}).`

        });

      }


      /*
       * Requeue
       */

      if (
        stats.requeued >=
        CONFIG
          .REQUEUE_COUNT_THRESHOLD
      ) {

        alerts.push({

          severity:
            'medium',

          type:
            'Requeue',

          agent:
            agent,

          message:
            `${agent} has ${stats.requeued} requeued task(s).`

        });

      }


      /*
       * Repeated incomplete reasons
       */

      Object.entries(
        stats.incompleteReasons
      ).forEach(
        ([reason, count]) => {

          if (
            count >=
            CONFIG
              .REASON_SPIKE_THRESHOLD
          ) {

            alerts.push({

              severity:
                'medium',

              type:
                'Reason Spike',

              agent:
                agent,

              message:
                `${agent}: "${reason}" occurred ${count} times.`

            });

          }

        }
      );


      /*
       * Duration
       */

      if (
        stats.avgDurationSec !==
        null
      ) {

        if (
          stats.avgDurationSec <
          CONFIG.DURATION_LOW_SEC
        ) {

          alerts.push({

            severity:
              'low',

            type:
              'Average Duration',

            agent:
              agent,

            message:
              `${agent}'s average task duration is unusually short (${Math.round(stats.avgDurationSec)} seconds).`

          });

        }


        if (
          stats.avgDurationSec >
          CONFIG.DURATION_HIGH_SEC
        ) {

          alerts.push({

            severity:
              'medium',

            type:
              'Average Duration',

            agent:
              agent,

            message:
              `${agent}'s average task duration is unusually high (${Math.round(stats.avgDurationSec / 60)} minutes).`

          });

        }

      }

    }
  );


  return alerts;

}


/*******************************************************
 * BOTTLENECK ANALYSIS
 *******************************************************/

function identifyBottlenecks(
  stats
) {

  const bottlenecks = [];


  Object.entries(
    stats.orgs
  ).forEach(
    ([org, data]) => {

      if (
        data.total === 0
      ) {

        return;

      }


      const incompleteRate =
        data.incomplete /
        data.total;


      const requeueRate =
        data.requeued /
        data.total;


      const riskScore =
        (
          incompleteRate *
          70
        ) +
        (
          requeueRate *
          30
        );


      let risk =
        'Low';


      if (
        riskScore >= 40
      ) {

        risk =
          'High';

      }

      else if (
        riskScore >= 20
      ) {

        risk =
          'Medium';

      }


      bottlenecks.push({

        organization:
          org,

        total:
          data.total,

        completed:
          data.completed,

        incomplete:
          data.incomplete,

        requeued:
          data.requeued,

        incompleteRate:
          incompleteRate,

        requeueRate:
          requeueRate,

        riskScore:
          riskScore,

        risk:
          risk

      });

    }
  );


  return bottlenecks.sort(
    (a, b) =>
      b.riskScore -
      a.riskScore
  );

}


/*******************************************************
 * MAIN DASHBOARD FUNCTION
 *******************************************************/

function getDashboardData(
  startDateStr,
  endDateStr,
  selectedAgent
) {

  /*
   * Read workbook ONCE.
   */

  const allRecords =
    readOperationalData();


  /*
   * Apply date filter.
   */

  const filteredRecords =
    filterRecords(
      allRecords,
      startDateStr,
      endDateStr
    );


  /*
   * Global stats.
   */

  const globalStats =
    createStats();


  /*
   * Agent stats.
   */

  const agents = {};


  filteredRecords.forEach(
    record => {

      addRecordToStats(
        globalStats,
        record
      );


      if (
        !agents[
          record.agent
        ]
      ) {

        agents[
          record.agent
        ] =
          createStats();

      }


      addRecordToStats(
        agents[
          record.agent
        ],
        record
      );

    }
  );


  finalizeStats(
    globalStats
  );


  Object.values(
    agents
  ).forEach(
    stats =>
      finalizeStats(
        stats
      )
  );


  /*
   * Today's stats.
   */

  const todayData =
    buildTodayStats(
      allRecords
    );


  /*
   * Number of active agents.
   */

  const activeAgentCount =
    Object.keys(
      agents
    ).length;


  /*
   * Team daily target.
   */

  const teamDailyTarget =
    activeAgentCount *
    CONFIG
      .DAILY_TARGET_PER_AGENT;


  /*
   * Today's completed.
   */

  const todayCompleted =
    todayData
      .team
      .completed;


  /*
   * Team pacing.
   */

  const teamPacing =
    teamDailyTarget > 0

      ? todayCompleted /
        teamDailyTarget

      : 0;


  /*
   * Selected agent pace.
   */

  let selectedAgentToday =
    null;


  let selectedAgentPacing =
    0;


  if (
    selectedAgent &&
    selectedAgent !== 'All'
  ) {

    selectedAgentToday =
      todayData
        .agents[
          selectedAgent
        ] ||
      createStats();


    selectedAgentPacing =
      CONFIG
        .DAILY_TARGET_PER_AGENT > 0

        ? selectedAgentToday.completed /
          CONFIG
            .DAILY_TARGET_PER_AGENT

        : 0;

  }


  /*
   * Rankings.
   */

  const rankings =
    buildAgentRankings(
      agents,
      todayData.agents
    );


  /*
   * Alerts.
   */

  const alerts =
    generateAlerts(
      agents
    );


  /*
   * Bottlenecks.
   */

  const bottlenecks =
    identifyBottlenecks(
      globalStats
    );


  /*
   * Trend.
   *
   * IMPORTANT:
   * Use filteredRecords rather than allRecords
   * so the trend respects the selected date range.
   */

  const trend =
    buildTrendData(
      filteredRecords,
      selectedAgent
    );


  /*
   * Final response.
   */

  return {

    global:
      globalStats,

    agents:
      agents,

    rankings:
      rankings,

    alerts:
      alerts,

    bottlenecks:
      bottlenecks,

    trend:
      trend,

    today: {

      date:
        todayData.date,

      completed:
        todayCompleted,

      incomplete:
        todayData
          .team
          .incomplete,

      requeued:
        todayData
          .team
          .requeued,

      teamTarget:
        teamDailyTarget,

      pacing:
        teamPacing,

      targetAttainment:
        teamPacing,

      selectedAgentCompleted:
        selectedAgentToday
          ? selectedAgentToday.completed
          : null,

      selectedAgentPacing:
        selectedAgentPacing

    },

    config: {

      dailyTargetPerAgent:
        CONFIG
          .DAILY_TARGET_PER_AGENT,

      activeAgents:
        activeAgentCount,

      teamDailyTarget:
        teamDailyTarget

    },

    metadata: {

      totalRowsRead:
        allRecords.length,

      filteredRows:
        filteredRecords.length,

      generatedAt:
        new Date()
          .toISOString()

    }

  };

}


/*******************************************************
 * TREND COMPATIBILITY FUNCTION
 *******************************************************/

function getTrendData(
  numDays,
  selectedAgent
) {

  const records =
    readOperationalData();


  const original =
    CONFIG.TREND_DAYS;


  if (
    numDays
  ) {

    CONFIG.TREND_DAYS =
      Number(numDays);

  }


  const result =
    buildTrendData(
      records,
      selectedAgent
    );


  CONFIG.TREND_DAYS =
    original;


  return result;

}


/*******************************************************
 * RAW ROWS
 *******************************************************/

function getRawRows(
  startDateStr,
  endDateStr
) {

  const records =
    readOperationalData();


  const filtered =
    filterRecords(
      records,
      startDateStr,
      endDateStr
    );


  return filtered.map(
    record => ({

      agent:
        record.agent,

      reason:
        record.reason,

      org:
        record.org,

      status:
        record.status,

      date:
        record.dateKey,

      durationSec:
        record.durationSec

    })
  );

}


/*******************************************************
 * DAILY EMAIL ALERT CHECK
 *******************************************************/

function runDailyChecks() {

  const today =
    getTodayKey();


  const data =
    getDashboardData(
      today,
      today,
      'All'
    );


  if (
    !data.alerts ||
    data.alerts.length === 0
  ) {

    console.log(
      'No operational alerts for ' +
      today
    );

    return;

  }


  const body =
    [
      `Team Performance Alerts — ${today}`,
      '',
      ...data.alerts.map(
        alert =>
          `• ${alert.message}`
      )
    ]
    .join('\n');


  MailApp.sendEmail({

    to:
      'admin@demo-company.com',

    subject:
      `⚠️ Team Performance Alerts — ${today}`,

    body:
      body

  });

}
