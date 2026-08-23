/* global document, fetch, localStorage, window */

const DEFAULT_BUILD_INFO = {
  status: 'unknown',
  generatedAt: null,
  branch: 'main',
  commit: '—',
  workflowUrl: null,
  metrics: {
    logicalTests: 39,
    executions: 110,
    browsers: 3,
    qualityChecks: '3/3',
  },
  reports: {
    functional: { available: false, status: 'unknown' },
    visual: { available: false, status: 'unknown' },
    allure: { available: false, status: 'unknown' },
    quality: { available: false, status: 'unknown' },
    coverage: { available: false, status: 'planned' },
  },
};

const STATUS_LABELS = {
  passed: 'Conforme',
  failed: 'Échec',
  planned: 'À venir',
  unknown: 'Indisponible',
};

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = String(value);
  }
}

function normalizeStatus(status) {
  return Object.hasOwn(STATUS_LABELS, status) ? status : 'unknown';
}

function formatDate(value) {
  if (!value) {
    return 'Données CI indisponibles';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(date);
}

function updateStatusElement(element, status) {
  const normalizedStatus = normalizeStatus(status);

  element.className = `status status--${normalizedStatus}`;
  element.textContent = STATUS_LABELS[normalizedStatus];
}

function updateReportCards(reports) {
  for (const card of document.querySelectorAll('[data-report]')) {
    const reportName = card.dataset.report;
    const report = reports[reportName] ?? {
      available: false,
      status: 'unknown',
    };
    const statusElement = card.querySelector('[data-report-status]');
    const link = card.querySelector('[data-report-link]');

    if (statusElement) {
      updateStatusElement(
        statusElement,
        report.available ? report.status : 'unknown',
      );
    }

    if (link && !report.available) {
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.addEventListener('click', event => event.preventDefault());
    }
  }
}

function updatePortal(buildInfo) {
  const globalStatus = document.getElementById('globalStatus');
  const workflowLink = document.getElementById('workflowLink');

  if (globalStatus) {
    updateStatusElement(globalStatus, buildInfo.status);
  }

  setText('branchValue', buildInfo.branch ?? 'main');
  setText('commitValue', buildInfo.commit ?? '—');
  setText('generatedAtValue', formatDate(buildInfo.generatedAt));
  setText('logicalTestsValue', buildInfo.metrics.logicalTests);
  setText('executionsValue', buildInfo.metrics.executions);
  setText('browsersValue', buildInfo.metrics.browsers);
  setText('qualityChecksValue', buildInfo.metrics.qualityChecks);

  if (workflowLink && buildInfo.workflowUrl) {
    workflowLink.href = buildInfo.workflowUrl;
    workflowLink.textContent = 'Ouvrir dans GitHub Actions';
  }

  updateReportCards(buildInfo.reports);
}

async function loadBuildInfo() {
  try {
    const response = await fetch('./build-info.json', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const buildInfo = await response.json();

    return {
      ...DEFAULT_BUILD_INFO,
      ...buildInfo,
      metrics: {
        ...DEFAULT_BUILD_INFO.metrics,
        ...buildInfo.metrics,
      },
      reports: {
        ...DEFAULT_BUILD_INFO.reports,
        ...buildInfo.reports,
      },
    };
  } catch {
    return DEFAULT_BUILD_INFO;
  }
}

function initializeTheme() {
  const toggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('qa-portal-theme');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
  }

  toggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.dataset.theme;
    const systemUsesDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const effectiveTheme =
      currentTheme ?? (systemUsesDark ? 'dark' : 'light');
    const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('qa-portal-theme', nextTheme);
  });
}

initializeTheme();

loadBuildInfo().then(updatePortal, () => updatePortal(DEFAULT_BUILD_INFO));
