import { generateMonthlyReport } from '../src/lib/seo-engine';

async function testEngine() {
  console.log('--- Starting SEO Engine Test ---');
  const domain = 'example.com';
  try {
    const report = await generateMonthlyReport(domain);
    console.log(`Generated Report for ${domain}:`);
    console.log(`Month/Year: ${report.month} ${report.year}`);
    console.log(`Overall Score: ${report.overallScore}`);
    console.log(`Top Keyword: ${report.topKeywords[0].keyword} (Score: ${report.topKeywords[0].opportunityScore})`);
    console.log(`Audit Issues: ${report.audit.issues.length}`);
    console.log(`Content Suggestions: ${report.contentPlan.length}`);
    console.log('--- Test Completed Successfully ---');
  } catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
  }
}

testEngine();
