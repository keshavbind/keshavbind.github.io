// Project data and card rendering.
// To add or edit a project, change the PROJECTS list below.
// A GitHub button is shown on a card only when `github` holds a valid repository URL.
(function (global) {
  'use strict';

  const PROJECTS = Object.freeze([
    {
      slug: 'ai-resume-analyzer', cat: 'ai', icon: 'file-search', title: 'AI Resume Analyzer',
      desc: 'An AI-powered application that lets users upload PDF resumes and receive AI-generated resume analysis.',
      tags: ['Python', 'FastAPI', 'Streamlit', 'Gemini API', 'PDF Processing'],
      github: 'https://github.com/keshavbind/AI-Resume-Analyzer'
    },
    {
      slug: 'geministock-ai', cat: 'ai', icon: 'boxes', title: 'GeminiStock AI',
      desc: 'An inventory management agent: manage products and stock levels through natural language instructions.',
      tags: ['Python', 'Gemini API', 'Function Calling', 'MySQL'],
      github: 'https://github.com/keshavbind/GeminiStock-AI'
    },
    {
      slug: 'chatapp', cat: 'android', icon: 'messages-square', title: 'ChatApp',
      desc: 'A real-time messaging Android app with user authentication and Firebase-powered chat.',
      tags: ['Kotlin', 'Firebase Auth', 'Firestore', 'RecyclerView', 'Material 3'],
      github: 'https://github.com/keshavbind/ChatApp'
    },
    {
      slug: 'taskactivity', cat: 'android', icon: 'list-checks', title: 'TaskActivity',
      desc: 'An Android task manager with local database storage and reactive UI updates.',
      tags: ['Kotlin', 'Room', 'LiveData', 'Coroutines', 'MVVM'],
      github: 'https://github.com/keshavbind/TaskActivity'
    },
    {
      slug: 'brewkery', cat: 'android', icon: 'coffee', title: 'Brewkery',
      desc: 'A coffee and bakery ordering app with product browsing, customization, cart management and checkout.',
      tags: ['Kotlin', 'MVVM', 'Retrofit', 'Coroutines', 'Glide'],
      github: 'https://github.com/keshavbind/Brewkery'
    },
    {
      slug: 'talemint', cat: 'android', icon: 'feather', title: 'TaleMint',
      desc: 'A digital publishing platform for discovering and publishing short stories, poetry and lyrics.',
      tags: ['Kotlin', 'Firebase', 'Retrofit', 'MVVM'],
      github: 'https://github.com/keshavbind/TaleMint'
    }
  ]);

  const CATEGORY_LABEL = { ai: 'AI Project', android: 'Android Project' };
  const VALID_FILTERS = ['all', 'ai', 'android'];
  // Only plain https://github.com/<owner>/<repo> links are accepted.
  const GITHUB_REPO_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

  // Lucide replaces <i data-lucide="..."> elements with SVG icons.
  function refreshIcons() {
    try {
      if (global.lucide && typeof global.lucide.createIcons === 'function') global.lucide.createIcons();
    } catch (err) {
      console.warn('Icons could not be refreshed:', err);
    }
  }

  // Creates an element and sets its text with textContent (never innerHTML).
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function icon(name) {
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  // Builds one project card as DOM nodes.
  function createProjectCard(p) {
    const card = el('article', 'card project');

    const thumb = el('div', 'thumb ' + p.cat);
    thumb.setAttribute('role', 'img');
    thumb.setAttribute('aria-label', 'Screenshot placeholder for ' + p.title);
    thumb.appendChild(icon(p.icon));
    thumb.appendChild(el('span', '', 'Screenshot coming soon'));
    card.appendChild(thumb);

    const body = el('div', 'p-body');
    body.appendChild(el('span', 'badge', CATEGORY_LABEL[p.cat] || 'Project'));
    body.appendChild(el('h3', '', p.title));
    body.appendChild(el('p', '', p.desc));

    const tags = el('ul', 'chips');
    p.tags.forEach(function (tag) { tags.appendChild(el('li', '', tag)); });
    body.appendChild(tags);

    // Reuses the existing .actions layout; the margin is overridden so the buttons sit close to the tags.
    const actions = el('div', 'actions');
    actions.style.margin = '.25rem 0 0';

    const details = el('a', 'btn ghost sm', 'View Details');
    details.href = 'projects/' + p.slug + '.html';
    details.setAttribute('aria-label', 'View Details: ' + p.title);
    actions.appendChild(details);

    if (typeof p.github === 'string' && GITHUB_REPO_URL.test(p.github)) {
      const gh = el('a', 'btn ghost sm');
      gh.href = p.github;
      gh.target = '_blank';
      gh.rel = 'noopener noreferrer';
      gh.setAttribute('aria-label', p.title + ' source code on GitHub (opens in a new tab)');
      gh.appendChild(icon('github'));
      gh.appendChild(document.createTextNode('GitHub'));
      actions.appendChild(gh);
    }

    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  // Renders the grid for a filter value: 'all', 'ai' or 'android'. Unknown values show all projects.
  function renderProjects(filter) {
    const grid = document.getElementById('projectGrid');
    if (!grid) return;

    const key = VALID_FILTERS.indexOf(filter) === -1 ? 'all' : filter;
    const list = key === 'all' ? PROJECTS : PROJECTS.filter(function (p) { return p.cat === key; });

    const fragment = document.createDocumentFragment();
    list.forEach(function (p) { fragment.appendChild(createProjectCard(p)); });

    grid.textContent = '';
    grid.appendChild(fragment);
    refreshIcons(); // turn the new <i data-lucide> placeholders into SVG icons
  }

  global.PROJECTS = PROJECTS;
  global.renderProjects = renderProjects;
})(window);