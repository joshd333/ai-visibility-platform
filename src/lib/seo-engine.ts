import { KeywordData, AuditResult, ContentSuggestion, MonthlyReport } from '../types/seo';

const SPYFU_SECRET = process.env.SPYFU_API_KEY;
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;
const SERPER_KEY = process.env.SERPER_API_KEY;
const dataForSEOAuth = Buffer.from(DATAFORSEO_LOGIN + ':' + DATAFORSEO_PASSWORD).toString('base64');

export const getSpyFuDomainOverview = async (domain) => {
  try {
    const res = await fetch('https://api.spyfu.com/apis/domain_stats_api/v2/getAllDomainStats?domain=' + domain + '&countryCode=US&api_key=' + SPYFU_SECRET);
    const data = await res.json();
    const results = data.results || [];
    const latest = results[results.length - 1] || {};
    return { organicKeywords: latest.totalOrganicResults || 0, organicTraffic: Math.round(latest.monthlyOrganicClicks || 0), trafficValue: Math.round(latest.monthlyOrganicValue || 0), paidKeywords: latest.totalAdsPurchased || 0, domainStrength: latest.strength || 0, avgOrganicRank: latest.averageOrganicRank || 0 };
  } catch (err) { console.error('SpyFu domain overview error:', err); return { organicKeywords: 0, organicTraffic: 0, trafficValue: 0, paidKeywords: 0, domainStrength: 0, avgOrganicRank: 0 }; }
};

export const getSpyFuCompetitors = async (domain) => {
  try {
    const res = await fetch('https://api.spyfu.com/apis/competitors_api/v2/seo/getTopCompetitors?domain=' + domain + '&countryCode=US&pageSize=5&api_key=' + SPYFU_SECRET);
    const data = await res.json();
    return (data.results || []).slice(0, 5).map((c) => c.domain || '');
  } catch (err) { console.error('SpyFu competitors error:', err); return []; }
};

export const getSpyFuKeywords = async (domain) => {
  try {
    const res = await fetch('https://api.spyfu.com/apis/serp_api/v2/seo/getSeoKeywords?query=' + domain + '&searchType=MostValuable&pageSize=10&countryCode=US&api_key=' + SPYFU_SECRET);
    const data = await res.json();
    return (data.results || []).map((k) => ({ keyword: k.keyword || '', volume: k.searchVolume || 0, difficulty: k.keywordDifficulty || 0, opportunityScore: k.seoClicks || 0 }));
  } catch (err) { console.error('SpyFu keywords error:', err); return []; }
};

export const getSpyFuKeywordGaps = async (domain, competitor) => {
  try {
    const res = await fetch('https://api.spyfu.com/apis/serp_api/v2/seo/getSeoKeywords?query=' + competitor + '&searchType=MostValuable&pageSize=10&countryCode=US&compareDomain=' + domain + '&api_key=' + SPYFU_SECRET);
    const data = await res.json();
    return (data.results || []).map((k) => ({ keyword: k.keyword || '', volume: k.searchVolume || 0, difficulty: k.keywordDifficulty || 0, opportunityScore: k.seoClicks || 0 }));
  } catch (err) { console.error('SpyFu keyword gaps error:', err); return []; }
};

export const runTechnicalAudit = async (url) => {
  try {
    const domain = url.replace('https://', '').replace('http://', '');
    const taskRes = await fetch('https://api.dataforseo.com/v3/on_page/task_post', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + dataForSEOAuth, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ target: domain, max_crawl_pages: 10, load_resources: false, enable_javascript: false }]),
    });
    const taskData = await taskRes.json();
    const taskId = taskData.tasks && taskData.tasks[0] && taskData.tasks[0].id;
    if (!taskId) throw new Error('No task ID returned');
    let attempts = 0;
    while (attempts < 24) {
      await new Promise(r => setTimeout(r, 5000));
      const resultRes = await fetch('https://api.dataforseo.com/v3/on_page/summary/' + taskId, {
        headers: { 'Authorization': 'Basic ' + dataForSEOAuth },
      });
      const resultData = await resultRes.json();
      const result = resultData.tasks && resultData.tasks[0] && resultData.tasks[0].result && resultData.tasks[0].result[0];
      if (result && result.crawl_progress === 'finished') {
        const checks = result.page_metrics && result.page_metrics.checks || {};
        const issues = [];
        if (checks.no_description > 0) issues.push({ severity: 'medium', category: 'seo', message: checks.no_description + ' pages missing meta descriptions' });
        if (checks.no_image_alt > 0) issues.push({ severity: 'low', category: 'seo', message: checks.no_image_alt + ' images missing alt tags' });
        if (checks.title_too_long > 0) issues.push({ severity: 'low', category: 'seo', message: checks.title_too_long + ' pages with title too long' });
        if (checks.is_http > 0) issues.push({ severity: 'high', category: 'seo', message: checks.is_http + ' pages served over HTTP instead of HTTPS' });
        if (checks.broken_links > 0) issues.push({ severity: 'high', category: 'seo', message: checks.broken_links + ' broken links found' });
        if (checks.no_h1_tag > 0) issues.push({ severity: 'medium', category: 'seo', message: checks.no_h1_tag + ' pages missing H1 tag' });
        if (checks.duplicate_content > 0) issues.push({ severity: 'medium', category: 'seo', message: checks.duplicate_content + ' pages with duplicate content' });
        if (checks.https_to_http_links > 0) issues.push({ severity: 'low', category: 'seo', message: checks.https_to_http_links + ' HTTPS pages linking to HTTP resources' });
        return {
          score: result.page_metrics && result.page_metrics.onpage_score || 0,
          issues: issues.slice(0, 10),
        };
      }
      attempts++;
    }
    return { score: 0, issues: [] };
  } catch (err) {
    console.error('DataForSEO audit error:', err);
    return { score: 0, issues: [] };
  }
};

export const getBacklinkData = async (domain) => {
  try {
    const res = await fetch('https://api.dataforseo.com/v3/backlinks/summary/live', { method: 'POST', headers: { 'Authorization': 'Basic ' + dataForSEOAuth, 'Content-Type': 'application/json' }, body: JSON.stringify([{ target: domain, include_subdomains: true, backlinks_status_type: 'live', rank_scale: 'one_hundred' }]) });
    const data = await res.json();
    const result = data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0];
    return { totalBacklinks: result && result.backlinks || 0, referringDomains: result && result.referring_domains || 0, domainRank: result && result.rank || 0, spamScore: result && result.backlinks_spam_score || 0 };
  } catch (err) { console.error('DataForSEO backlinks error:', err); return { totalBacklinks: 0, referringDomains: 0, domainRank: 0, spamScore: 0 }; }
};

export const checkLiveRankings = async (domain, keywords) => {
  try {
    const results = await Promise.all(keywords.slice(0, 5).map(async (keyword) => {
      const res = await fetch('https://google.serper.dev/search', { method: 'POST', headers: { 'X-API-KEY': SERPER_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: keyword, num: 20 }) });
      const data = await res.json();
      const position = (data.organic || []).findIndex((r) => r.link && r.link.includes(domain));
      return { keyword, position: position === -1 ? null : position + 1, url: position === -1 ? null : data.organic[position].link };
    }));
    return results;
  } catch (err) { console.error('Serper rank check error:', err); return []; }
};

export const generateContentPlan = async (keywords) => {
  return keywords.slice(0, 3).map(kw => ({ title: 'How to dominate ' + kw.keyword + ' in 2026', description: 'A guide targeting ' + kw.keyword + ' with volume ' + kw.volume + '/mo.', suggestedKeywords: [kw.keyword, 'seo strategy', 'ranking guide'] }));
};

export const generateMonthlyReport = async (domain) => {
  console.log('[' + domain + '] Starting full analysis...');
  const [domainOverview, competitors, keywords, backlinks] = await Promise.all([getSpyFuDomainOverview(domain), getSpyFuCompetitors(domain), getSpyFuKeywords(domain), getBacklinkData(domain)]);
  const audit = { score: 0, issues: [] }; // fetched async via /api/audit/*
  console.log('[' + domain + '] Domain overview:', domainOverview);
  console.log('[' + domain + '] Competitors:', competitors);
  console.log('[' + domain + '] Keywords count:', keywords.length);
  console.log('[' + domain + '] Backlinks:', backlinks);
  const keywordGaps = competitors.length > 0 ? await getSpyFuKeywordGaps(domain, competitors[0]) : [];
  const topKeywordStrings = keywords.slice(0, 5).map(k => k.keyword).filter(Boolean);
  const liveRankings = topKeywordStrings.length > 0 ? await checkLiveRankings(domain, topKeywordStrings) : [];
  const contentPlan = await generateContentPlan(keywords);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  return {
    month: months[now.getMonth()],
    year: now.getFullYear(),
    overallScore: domainOverview.domainStrength || 0,
    topKeywords: keywords,
    audit,
    contentPlan,
    nextSteps: [
      keywordGaps[0] ? 'Target keyword gap: ' + keywordGaps[0].keyword : 'Expand keyword coverage',
      audit.issues[0] ? 'Fix: ' + audit.issues[0].message : 'Maintain technical health',
      liveRankings[0] && liveRankings[0].position ? 'Improve position for ' + liveRankings[0].keyword + ' (currently #' + liveRankings[0].position + ')' : 'Build ranking presence',
    ],
    domainOverview,
    competitors,
    keywordGaps,
    liveRankings,
    backlinks,
  };
};
