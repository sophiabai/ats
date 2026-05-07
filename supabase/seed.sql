-- Seed data for local development
-- Automatically run by `supabase db reset`

-- ============================================================
-- Candidates (27 candidates with stable UUIDs)
-- ============================================================
INSERT INTO candidates (id, first_name, last_name, email, phone, location, headline, years_experience, current_company, current_title, skills, tags) VALUES
  -- Engineering candidates
  ('c0000000-0000-0000-0000-000000000001', 'Emily', 'Zhang', 'emily.zhang@email.com', '415-555-0101', 'San Francisco', 'Full-stack engineer with 6 years of experience', 6, 'Stripe', 'Senior Software Engineer', ARRAY['TypeScript','React','Node.js','PostgreSQL'], ARRAY['referral','senior']),
  ('c0000000-0000-0000-0000-000000000002', 'Alex', 'Rivera', 'alex.r@email.com', '512-555-0104', 'Austin', 'Data engineer passionate about analytics', 4, 'Databricks', 'Data Engineer', ARRAY['Python','Spark','dbt','SQL'], ARRAY['data','mid-level']),
  ('c0000000-0000-0000-0000-000000000003', 'Liam', 'O''Brien', 'liam.ob@email.com', '415-555-0106', 'San Francisco', 'Frontend specialist with design systems experience', 5, 'Airbnb', 'Frontend Engineer', ARRAY['React','TypeScript','CSS','Storybook'], ARRAY['referral','mid-level']),
  ('c0000000-0000-0000-0000-000000000004', 'Nina', 'Patel', 'nina.p@email.com', '408-555-0107', 'San Jose', 'React and performance optimization expert', 7, 'Netflix', 'Senior Frontend Engineer', ARRAY['React','Next.js','Performance','GraphQL'], ARRAY['senior','careers_page']),
  ('c0000000-0000-0000-0000-000000000005', 'Jordan', 'Kim', 'jordan.k@email.com', '206-555-0108', 'Seattle', 'Full-stack engineer moving into frontend focus', 4, 'Amazon', 'Software Engineer', ARRAY['TypeScript','React','AWS','Java'], ARRAY['mid-level','linkedin']),
  ('c0000000-0000-0000-0000-000000000006', 'Tyler', 'Washington', 'tyler.w@email.com', '303-555-0109', 'Denver', 'Data platform builder at scale', 6, 'Snowflake', 'Senior Data Engineer', ARRAY['Python','Airflow','Snowflake','Kafka'], ARRAY['senior','linkedin']),
  ('c0000000-0000-0000-0000-000000000007', 'Ava', 'Nguyen', 'ava.n@email.com', '415-555-0110', 'San Francisco', 'Analytics engineer with ML background', 3, 'Lyft', 'Data Engineer', ARRAY['Python','dbt','BigQuery','Looker'], ARRAY['mid-level','referral']),
  ('c0000000-0000-0000-0000-000000000008', 'Daniel', 'Santos', 'daniel.s@email.com', '512-555-0111', 'Austin', 'Backend-heavy with data pipeline expertise', 5, 'Meta', 'Software Engineer', ARRAY['Python','Spark','Flink','PostgreSQL'], ARRAY['senior','agency']),
  ('c0000000-0000-0000-0000-000000000009', 'Mia', 'Thompson', 'mia.t@email.com', '415-555-0112', 'San Francisco', 'Accessibility-focused frontend engineer', 3, 'Slack', 'Frontend Engineer', ARRAY['React','Accessibility','CSS','Testing'], ARRAY['mid-level','careers_page']),
  -- Sales candidates
  ('c0000000-0000-0000-0000-000000000010', 'Marcus', 'Johnson', 'marcus.j@email.com', '312-555-0102', 'Chicago', 'Enterprise sales leader', 8, 'Salesforce', 'Account Executive', ARRAY['Enterprise Sales','Salesforce','Negotiation'], ARRAY['enterprise','experienced']),
  ('c0000000-0000-0000-0000-000000000011', 'Rachel', 'Foster', 'rachel.f@email.com', '312-555-0113', 'Chicago', 'Mid-market AE with SaaS background', 5, 'Zendesk', 'Account Executive', ARRAY['SaaS Sales','HubSpot','Pipeline Management'], ARRAY['mid-level','linkedin']),
  ('c0000000-0000-0000-0000-000000000012', 'Derek', 'Coleman', 'derek.c@email.com', '646-555-0114', 'New York', 'Enterprise sales with Fortune 500 experience', 10, 'Oracle', 'Senior Account Executive', ARRAY['Enterprise Sales','Contract Negotiation','CRM'], ARRAY['senior','agency']),
  ('c0000000-0000-0000-0000-000000000013', 'Jessica', 'Park', 'jessica.p@email.com', '312-555-0115', 'Chicago', 'SDR turned AE with strong pipeline generation', 4, 'Gong', 'Account Executive', ARRAY['Outbound Sales','Salesforce','Cold Calling'], ARRAY['mid-level','referral']),
  ('c0000000-0000-0000-0000-000000000014', 'Chris', 'Morgan', 'chris.m@email.com', '214-555-0116', 'Dallas', 'Sales leader breaking into tech from finance', 6, 'Goldman Sachs', 'VP of Sales', ARRAY['Relationship Management','Financial Sales','CRM'], ARRAY['career-changer','linkedin']),
  -- Design candidates
  ('c0000000-0000-0000-0000-000000000015', 'Priya', 'Sharma', 'priya.s@email.com', '646-555-0103', 'New York', 'Product designer specializing in B2B SaaS', 5, 'Figma', 'Senior Product Designer', ARRAY['Figma','Design Systems','User Research'], ARRAY['design','senior']),
  ('c0000000-0000-0000-0000-000000000016', 'Kai', 'Nakamura', 'kai.n@email.com', '646-555-0117', 'New York', 'Design leader with systems thinking approach', 8, 'Spotify', 'Lead Product Designer', ARRAY['Figma','Design Systems','Prototyping','Leadership'], ARRAY['senior','linkedin']),
  ('c0000000-0000-0000-0000-000000000017', 'Olivia', 'Hart', 'olivia.h@email.com', '415-555-0118', 'San Francisco', 'UX-focused designer with research skills', 4, 'Square', 'Product Designer', ARRAY['Figma','User Research','Wireframing','Usability Testing'], ARRAY['mid-level','careers_page']),
  ('c0000000-0000-0000-0000-000000000018', 'Sam', 'Adeyemi', 'sam.a@email.com', '646-555-0119', 'New York', 'Visual designer transitioning to product', 3, 'R/GA', 'Senior Visual Designer', ARRAY['Figma','Illustration','Branding','Motion'], ARRAY['mid-level','referral']),
  ('c0000000-0000-0000-0000-000000000019', 'Grace', 'Liu', 'grace.l@email.com', '206-555-0120', 'Seattle', 'Design systems expert with engineering background', 6, 'Microsoft', 'Senior Product Designer', ARRAY['Figma','Design Tokens','React','Accessibility'], ARRAY['senior','linkedin']),
  -- Marketing candidates
  ('c0000000-0000-0000-0000-000000000020', 'Sophie', 'Chen', 'sophie.c@email.com', '415-555-0105', 'San Francisco', 'Growth marketing expert', 7, 'HubSpot', 'Marketing Manager', ARRAY['SEO','Content Strategy','Analytics'], ARRAY['marketing','senior']),
  ('c0000000-0000-0000-0000-000000000021', 'Ethan', 'Brooks', 'ethan.b@email.com', '303-555-0121', 'Denver', 'Content strategist with B2B SaaS focus', 5, 'Contentful', 'Content Marketing Manager', ARRAY['Content Strategy','SEO','Copywriting','HubSpot'], ARRAY['mid-level','linkedin']),
  ('c0000000-0000-0000-0000-000000000022', 'Hannah', 'Wells', 'hannah.w@email.com', '512-555-0122', 'Austin', 'Demand gen and content marketing leader', 8, 'Marketo', 'Senior Content Lead', ARRAY['Content Marketing','Demand Gen','Marketing Automation','Analytics'], ARRAY['senior','referral']),
  ('c0000000-0000-0000-0000-000000000023', 'Ryan', 'O''Connor', 'ryan.oc@email.com', '646-555-0123', 'New York', 'Journalist turned content marketer', 4, 'The Verge', 'Staff Writer', ARRAY['Writing','Editing','SEO','Social Media'], ARRAY['career-changer','careers_page']),
  ('c0000000-0000-0000-0000-000000000024', 'Zoe', 'Martinez', 'zoe.m@email.com', '415-555-0124', 'San Francisco', 'Brand storyteller with startup experience', 6, 'Notion', 'Head of Content', ARRAY['Brand Strategy','Content Strategy','Video','Podcasting'], ARRAY['senior','agency']),
  ('c0000000-0000-0000-0000-000000000025', 'Isaac', 'Lee', 'isaac.l@email.com', '206-555-0125', 'Seattle', 'Technical content writer for developer audiences', 3, 'Vercel', 'Technical Writer', ARRAY['Technical Writing','Developer Marketing','MDX','SEO'], ARRAY['mid-level','linkedin']),
  ('c0000000-0000-0000-0000-000000000026', 'Jane', 'Warren', 'jane.w@email.com', '415-555-0126', 'San Francisco', 'Frontend engineer with design systems expertise', 6, 'Vercel', 'Senior Frontend Engineer', ARRAY['React','TypeScript','Next.js','Tailwind','Design Systems'], ARRAY['senior','referral']),
  ('c0000000-0000-0000-0000-000000000027', 'Marco', 'Alvarez', 'marco.a@email.com', '628-555-0127', 'San Francisco', 'Frontend platform engineer with micro-frontend expertise', 7, 'Shopify', 'Staff Frontend Engineer', ARRAY['React','TypeScript','Webpack','Micro-Frontends','Node.js'], ARRAY['senior','linkedin']);

-- ============================================================
-- Candidate work history, education & last activity
-- ============================================================

-- 1. Emily Zhang – Senior Software Engineer at Stripe
UPDATE candidates SET last_activity_action = 'Emailed candidate', last_activity_at = '2026-03-11T14:30:00Z',
work_history = '[
  {"company":"Stripe","title":"Senior Software Engineer","location":"San Francisco, CA","start_date":"2023-01","end_date":null,"description":"Lead frontend architecture for Stripe Dashboard, serving millions of merchants worldwide. Drove migration from legacy React codebase to Next.js, reducing page load times by 40%."},
  {"company":"Dropbox","title":"Software Engineer","location":"San Francisco, CA","start_date":"2020-06","end_date":"2022-12","description":"Built real-time collaboration features for Dropbox Paper. Implemented optimistic UI updates and conflict resolution for concurrent editing."},
  {"company":"Pivotal Labs","title":"Junior Software Engineer","location":"San Francisco, CA","start_date":"2019-01","end_date":"2020-05","description":"Delivered full-stack features for enterprise clients using pair programming and TDD. Worked across React, Rails, and Spring Boot projects."}
]'::jsonb,
education = '[
  {"school":"Stanford University","degree":"M.S.","field":"Computer Science","start_year":2019,"end_year":2021},
  {"school":"UC Berkeley","degree":"B.S.","field":"Computer Science","start_year":2015,"end_year":2019}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000001';

-- 2. Alex Rivera – Data Engineer at Databricks
UPDATE candidates SET last_activity_action = 'Submitted application', last_activity_at = '2026-03-09T10:15:00Z',
work_history = '[
  {"company":"Databricks","title":"Data Engineer","location":"Austin, TX","start_date":"2024-02","end_date":null,"description":"Build and maintain ETL pipelines processing 5TB+ daily using Spark and Delta Lake. Reduced pipeline failures by 60% through improved monitoring and retry logic."},
  {"company":"Indeed","title":"Junior Data Engineer","location":"Austin, TX","start_date":"2022-03","end_date":"2024-01","description":"Developed data ingestion pipelines for job posting analytics. Built dbt models powering executive dashboards tracking 300M+ job searches monthly."}
]'::jsonb,
education = '[
  {"school":"Georgia Tech","degree":"M.S.","field":"Computer Science","start_year":2022,"end_year":2024},
  {"school":"University of Texas at Austin","degree":"B.S.","field":"Computer Science","start_year":2018,"end_year":2022}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000002';

-- 3. Liam O'Brien – Frontend Engineer at Airbnb
UPDATE candidates SET last_activity_action = 'Recruiter screen scheduled', last_activity_at = '2026-03-10T16:45:00Z',
work_history = '[
  {"company":"Airbnb","title":"Frontend Engineer","location":"San Francisco, CA","start_date":"2023-04","end_date":null,"description":"Own the design system powering all Airbnb guest-facing surfaces. Led the migration to Airbnb''s new token-based theming architecture, enabling dark mode across 200+ components."},
  {"company":"Figma","title":"Frontend Engineer","location":"San Francisco, CA","start_date":"2021-06","end_date":"2023-03","description":"Built interactive canvas features for FigJam using WebGL and React. Contributed to Figma''s component library and design token infrastructure."},
  {"company":"Freelance","title":"Frontend Developer","location":"Remote","start_date":"2020-01","end_date":"2021-05","description":"Delivered web apps for startups using React, TypeScript, and Tailwind CSS. Built a component library used across 4 client projects."}
]'::jsonb,
education = '[
  {"school":"University College London","degree":"M.Sc.","field":"Human-Computer Interaction","start_year":2020,"end_year":2021},
  {"school":"Dublin City University","degree":"B.Sc.","field":"Computing","start_year":2016,"end_year":2020}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000003';

-- 4. Nina Patel – Senior Frontend Engineer at Netflix
UPDATE candidates SET last_activity_action = 'Offer extended', last_activity_at = '2026-03-12T09:00:00Z',
work_history = '[
  {"company":"Netflix","title":"Senior Frontend Engineer","location":"Los Gatos, CA","start_date":"2022-08","end_date":null,"description":"Lead performance optimization for the Netflix TV UI, reducing time-to-interactive by 35% on low-end devices. Architect the A/B testing framework used across all UI experiments."},
  {"company":"Google","title":"Frontend Engineer","location":"Mountain View, CA","start_date":"2020-01","end_date":"2022-07","description":"Built interactive data visualization components for Google Cloud Console. Implemented lazy loading and code splitting that reduced initial bundle size by 50%."},
  {"company":"Intuit","title":"Software Engineer","location":"Mountain View, CA","start_date":"2018-06","end_date":"2019-12","description":"Developed React components for TurboTax online filing experience serving 40M+ users during tax season."}
]'::jsonb,
education = '[
  {"school":"Stanford University","degree":"M.S.","field":"Computer Science","start_year":2016,"end_year":2018},
  {"school":"University of Michigan","degree":"B.S.E.","field":"Computer Science","start_year":2012,"end_year":2016}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000004';

-- 5. Jordan Kim – Software Engineer at Amazon
UPDATE candidates SET last_activity_action = 'Moved to technical screen', last_activity_at = '2026-03-08T11:20:00Z',
work_history = '[
  {"company":"Amazon","title":"Software Engineer","location":"Seattle, WA","start_date":"2023-07","end_date":null,"description":"Build and maintain microservices for Amazon Prime Video''s content delivery platform. Reduced API latency by 25% through caching optimizations and connection pooling."},
  {"company":"Tableau","title":"Software Engineer Intern","location":"Seattle, WA","start_date":"2022-06","end_date":"2022-09","description":"Developed a prototype for real-time collaborative dashboard editing using WebSockets and React."}
]'::jsonb,
education = '[
  {"school":"University of Washington","degree":"M.S.","field":"Computer Science","start_year":2023,"end_year":2025},
  {"school":"University of Washington","degree":"B.S.","field":"Computer Science","start_year":2019,"end_year":2023}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000005';

-- 6. Tyler Washington – Senior Data Engineer at Snowflake
UPDATE candidates SET last_activity_action = 'Interview completed', last_activity_at = '2026-03-07T15:30:00Z',
work_history = '[
  {"company":"Snowflake","title":"Senior Data Engineer","location":"Denver, CO","start_date":"2023-01","end_date":null,"description":"Design and operate real-time streaming pipelines using Kafka and Snowpipe, ingesting 2B+ events daily. Led migration from batch to streaming architecture, reducing data freshness from hours to minutes."},
  {"company":"Palantir","title":"Data Engineer","location":"Denver, CO","start_date":"2020-09","end_date":"2022-12","description":"Built data integration pipelines for government and commercial clients using Palantir Foundry. Developed reusable transforms processing classified datasets at petabyte scale."},
  {"company":"Lockheed Martin","title":"Data Analyst","location":"Denver, CO","start_date":"2019-06","end_date":"2020-08","description":"Automated reporting workflows using Python and Airflow, saving 20 hours per week of manual work. Built dashboards tracking satellite telemetry data."}
]'::jsonb,
education = '[
  {"school":"Colorado School of Mines","degree":"M.S.","field":"Data Science","start_year":2017,"end_year":2019},
  {"school":"University of Colorado Boulder","degree":"B.S.","field":"Applied Mathematics","start_year":2013,"end_year":2017}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000006';

-- 7. Ava Nguyen – Data Engineer at Lyft
UPDATE candidates SET last_activity_action = 'Scorecard submitted', last_activity_at = '2026-03-06T13:00:00Z',
work_history = '[
  {"company":"Lyft","title":"Data Engineer","location":"San Francisco, CA","start_date":"2024-03","end_date":null,"description":"Build and maintain the analytics data warehouse powering pricing and marketplace decisions. Developed dbt models that reduced query costs by 40% through incremental materialization."},
  {"company":"Coursera","title":"Analytics Engineer","location":"Mountain View, CA","start_date":"2023-01","end_date":"2024-02","description":"Owned the learner engagement data model, enabling product teams to track course completion and retention metrics across 100M+ users."}
]'::jsonb,
education = '[
  {"school":"UC San Diego","degree":"M.S.","field":"Data Science","start_year":2023,"end_year":2024},
  {"school":"UC San Diego","degree":"B.S.","field":"Data Science","start_year":2019,"end_year":2023}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000007';

-- 8. Daniel Santos – Software Engineer at Meta
UPDATE candidates SET last_activity_action = 'Emailed candidate', last_activity_at = '2026-03-05T17:45:00Z',
work_history = '[
  {"company":"Meta","title":"Software Engineer","location":"Austin, TX","start_date":"2023-06","end_date":null,"description":"Build real-time data pipelines for Instagram Reels recommendation system using Spark Streaming and Flink. Process 1T+ events daily with sub-second latency requirements."},
  {"company":"Confluent","title":"Software Engineer","location":"Austin, TX","start_date":"2021-08","end_date":"2023-05","description":"Developed Kafka Connect connectors for cloud storage sinks. Contributed to open-source Kafka Streams library with improvements to windowed aggregations."},
  {"company":"IBM","title":"Associate Software Engineer","location":"Austin, TX","start_date":"2020-06","end_date":"2021-07","description":"Built ETL pipelines for IBM Cloud Pak for Data using Apache Spark. Developed automated data quality checks for enterprise clients."}
]'::jsonb,
education = '[
  {"school":"Georgia Tech","degree":"M.S.","field":"Computer Science","start_year":2018,"end_year":2020},
  {"school":"University of São Paulo","degree":"B.S.","field":"Computer Engineering","start_year":2014,"end_year":2018}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000008';

-- 9. Mia Thompson – Frontend Engineer at Slack
UPDATE candidates SET last_activity_action = 'Rejected', last_activity_at = '2026-03-04T10:30:00Z',
work_history = '[
  {"company":"Slack","title":"Frontend Engineer","location":"San Francisco, CA","start_date":"2024-01","end_date":null,"description":"Build accessible UI components for Slack''s messaging interface. Led an accessibility audit that improved WCAG compliance from 72% to 96% across core workflows."},
  {"company":"Khan Academy","title":"Frontend Engineer","location":"Remote","start_date":"2023-01","end_date":"2023-12","description":"Developed interactive math exercises and lesson components using React. Ensured all new features met WCAG 2.1 AA standards for screen reader compatibility."}
]'::jsonb,
education = '[
  {"school":"Carnegie Mellon University","degree":"M.S.","field":"Human-Computer Interaction","start_year":2023,"end_year":2024},
  {"school":"San Francisco State University","degree":"B.S.","field":"Computer Science","start_year":2019,"end_year":2023}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000009';

-- 10. Marcus Johnson – Account Executive at Salesforce
UPDATE candidates SET last_activity_action = 'Onsite interview scheduled', last_activity_at = '2026-03-12T08:15:00Z',
work_history = '[
  {"company":"Salesforce","title":"Account Executive, Enterprise","location":"Chicago, IL","start_date":"2022-03","end_date":null,"description":"Manage a $4.2M annual quota selling Salesforce Platform and Data Cloud to Fortune 500 accounts. Closed the largest deal in Central region history at $1.8M ARR."},
  {"company":"ServiceNow","title":"Account Executive","location":"Chicago, IL","start_date":"2019-09","end_date":"2022-02","description":"Consistently exceeded quota by 120%+ selling IT workflow automation to mid-market and enterprise accounts. Built a $3M pipeline from scratch in the first year."},
  {"company":"CDW","title":"Inside Sales Representative","location":"Chicago, IL","start_date":"2017-06","end_date":"2019-08","description":"Top-performing ISR selling IT infrastructure solutions. Promoted to strategic accounts within 12 months."}
]'::jsonb,
education = '[
  {"school":"Kellogg School of Management","degree":"M.B.A.","field":"Marketing & Sales","start_year":2017,"end_year":2019},
  {"school":"Northwestern University","degree":"B.A.","field":"Economics","start_year":2013,"end_year":2017}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000010';

-- 11. Rachel Foster – Account Executive at Zendesk
UPDATE candidates SET last_activity_action = 'Hiring manager screen completed', last_activity_at = '2026-03-10T14:00:00Z',
work_history = '[
  {"company":"Zendesk","title":"Account Executive","location":"Chicago, IL","start_date":"2023-06","end_date":null,"description":"Own full-cycle sales for mid-market SaaS accounts in the Central region. Achieved 135% of quota in first full year by developing a consultative approach to customer support transformation."},
  {"company":"HubSpot","title":"Business Development Representative","location":"Chicago, IL","start_date":"2021-08","end_date":"2023-05","description":"Generated $2.1M in qualified pipeline through outbound prospecting. Promoted from BDR to Senior BDR in 10 months based on consistent top-quartile performance."}
]'::jsonb,
education = '[
  {"school":"University of Chicago Booth","degree":"M.B.A.","field":"Entrepreneurship","start_year":2021,"end_year":2023},
  {"school":"University of Illinois at Urbana-Champaign","degree":"B.S.","field":"Business Administration","start_year":2017,"end_year":2021}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000011';

-- 12. Derek Coleman – Senior Account Executive at Oracle
UPDATE candidates SET last_activity_action = 'Offer accepted', last_activity_at = '2026-03-11T09:45:00Z',
work_history = '[
  {"company":"Oracle","title":"Senior Account Executive","location":"New York, NY","start_date":"2021-01","end_date":null,"description":"Manage strategic relationships with 12 Fortune 500 accounts across financial services. Drove $8.5M in new ARR in FY25 through multi-year cloud migration deals."},
  {"company":"SAP","title":"Account Executive","location":"New York, NY","start_date":"2018-03","end_date":"2020-12","description":"Sold S/4HANA and cloud ERP solutions to enterprise manufacturing and retail accounts. Consistently in top 10% of global AE rankings."},
  {"company":"Dell Technologies","title":"Inside Sales Manager","location":"New York, NY","start_date":"2015-06","end_date":"2018-02","description":"Led a team of 8 ISRs covering the Northeast enterprise segment. Grew team revenue from $5M to $9M annually."}
]'::jsonb,
education = '[
  {"school":"Columbia Business School","degree":"M.B.A.","field":"Management","start_year":2013,"end_year":2015},
  {"school":"Boston University","degree":"B.A.","field":"Communications","start_year":2009,"end_year":2013}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000012';

-- 13. Jessica Park – Account Executive at Gong
UPDATE candidates SET last_activity_action = 'Moved to recruiter screen', last_activity_at = '2026-03-09T16:30:00Z',
work_history = '[
  {"company":"Gong","title":"Account Executive","location":"Chicago, IL","start_date":"2024-01","end_date":null,"description":"Sell revenue intelligence platform to mid-market sales organizations. Built $1.5M pipeline in first quarter through creative outbound and event-based strategies."},
  {"company":"Gong","title":"Senior SDR","location":"Chicago, IL","start_date":"2022-09","end_date":"2023-12","description":"Top-performing SDR generating 45+ qualified meetings per quarter. Developed an ABM playbook adopted by the entire Central SDR team."},
  {"company":"ZoomInfo","title":"SDR","location":"Chicago, IL","start_date":"2021-07","end_date":"2022-08","description":"Sourced and qualified leads for enterprise AEs through cold calling, email sequences, and social selling."}
]'::jsonb,
education = '[
  {"school":"Northwestern University","degree":"M.S.","field":"Integrated Marketing Communications","start_year":2021,"end_year":2022},
  {"school":"DePaul University","degree":"B.S.","field":"Marketing","start_year":2017,"end_year":2021}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000013';

-- 14. Chris Morgan – VP of Sales at Goldman Sachs
UPDATE candidates SET last_activity_action = 'Withdrew application', last_activity_at = '2026-03-08T12:00:00Z',
work_history = '[
  {"company":"Goldman Sachs","title":"VP, Institutional Sales","location":"Dallas, TX","start_date":"2021-06","end_date":null,"description":"Lead a 6-person team selling structured products to institutional investors across the Southwest. Grew regional AUM by $400M in two years through relationship-driven strategies."},
  {"company":"J.P. Morgan","title":"Associate, Sales & Trading","location":"New York, NY","start_date":"2018-07","end_date":"2021-05","description":"Covered hedge fund and asset manager clients for equity derivatives. Generated $12M in annual trading revenue through market intelligence and client advisory."},
  {"company":"Bank of America","title":"Analyst, Global Markets","location":"New York, NY","start_date":"2016-07","end_date":"2018-06","description":"Supported senior traders with market analysis, client pitches, and trade execution for fixed income products."}
]'::jsonb,
education = '[
  {"school":"Wharton School of Business","degree":"M.B.A.","field":"Finance","start_year":2016,"end_year":2018},
  {"school":"University of Texas at Austin","degree":"B.B.A.","field":"Finance","start_year":2012,"end_year":2016}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000014';

-- 15. Priya Sharma – Senior Product Designer at Figma
UPDATE candidates SET last_activity_action = 'Portfolio review completed', last_activity_at = '2026-03-13T10:00:00Z',
work_history = '[
  {"company":"Figma","title":"Senior Product Designer","location":"New York, NY","start_date":"2023-03","end_date":null,"description":"Lead design for Figma''s collaboration features including comments, sharing, and permissions. Shipped a redesigned sharing flow that increased team invitations by 28%."},
  {"company":"Notion","title":"Product Designer","location":"New York, NY","start_date":"2021-01","end_date":"2023-02","description":"Designed the databases and views experience used by millions of teams. Led user research studies that informed the rollout of Notion Projects."},
  {"company":"InVision","title":"Junior Product Designer","location":"Remote","start_date":"2020-01","end_date":"2020-12","description":"Designed prototyping and handoff workflows. Contributed to the design system used across InVision Studio and Cloud products."}
]'::jsonb,
education = '[
  {"school":"NYU Tisch School of the Arts","degree":"M.F.A.","field":"Design & Technology","start_year":2020,"end_year":2022},
  {"school":"Parsons School of Design","degree":"B.F.A.","field":"Communication Design","start_year":2016,"end_year":2020}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000015';

-- 16. Kai Nakamura – Lead Product Designer at Spotify
UPDATE candidates SET last_activity_action = 'Offer extended', last_activity_at = '2026-03-12T11:30:00Z',
work_history = '[
  {"company":"Spotify","title":"Lead Product Designer","location":"New York, NY","start_date":"2022-01","end_date":null,"description":"Lead a team of 4 designers on Spotify''s creator tools platform. Defined the design vision for podcast analytics and Spotify for Podcasters, serving 5M+ creators."},
  {"company":"Spotify","title":"Senior Product Designer","location":"New York, NY","start_date":"2019-06","end_date":"2021-12","description":"Designed the listening activity and social features for Spotify mobile. Shipped Blend and Group Session features used by 50M+ users monthly."},
  {"company":"IDEO","title":"Interaction Designer","location":"San Francisco, CA","start_date":"2017-08","end_date":"2019-05","description":"Led design sprints and prototyping for Fortune 500 clients across healthcare, finance, and consumer electronics. Specialized in systems thinking and service design."}
]'::jsonb,
education = '[
  {"school":"Rhode Island School of Design","degree":"M.F.A.","field":"Graphic Design","start_year":2015,"end_year":2017},
  {"school":"Keio University","degree":"B.A.","field":"Media and Governance","start_year":2010,"end_year":2014}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000016';

-- 17. Olivia Hart – Product Designer at Square
UPDATE candidates SET last_activity_action = 'Reference check initiated', last_activity_at = '2026-03-07T09:15:00Z',
work_history = '[
  {"company":"Square","title":"Product Designer","location":"San Francisco, CA","start_date":"2023-09","end_date":null,"description":"Design onboarding and activation flows for Square''s point-of-sale product. Increased new merchant activation rate by 18% through simplified setup wizard."},
  {"company":"Asana","title":"Product Designer","location":"San Francisco, CA","start_date":"2022-01","end_date":"2023-08","description":"Owned the task detail and project views experience. Conducted 40+ usability tests to validate interaction patterns for the new board view."}
]'::jsonb,
education = '[
  {"school":"Royal College of Art","degree":"M.A.","field":"Service Design","start_year":2022,"end_year":2023},
  {"school":"California College of the Arts","degree":"B.F.A.","field":"Interaction Design","start_year":2018,"end_year":2022}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000017';

-- 18. Sam Adeyemi – Senior Visual Designer at R/GA
UPDATE candidates SET last_activity_action = 'Emailed candidate', last_activity_at = '2026-03-06T14:20:00Z',
work_history = '[
  {"company":"R/GA","title":"Senior Visual Designer","location":"New York, NY","start_date":"2023-06","end_date":null,"description":"Lead visual design for brand campaigns across Nike, Samsung, and Google accounts. Developed motion design systems for cross-platform digital experiences."},
  {"company":"Pentagram","title":"Junior Designer","location":"New York, NY","start_date":"2022-01","end_date":"2023-05","description":"Supported identity and brand design projects for cultural institutions and tech companies. Designed a visual identity system for a major museum rebrand."}
]'::jsonb,
education = '[
  {"school":"Yale School of Art","degree":"M.F.A.","field":"Graphic Design","start_year":2022,"end_year":2024},
  {"school":"School of Visual Arts","degree":"B.F.A.","field":"Graphic Design","start_year":2018,"end_year":2022}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000018';

-- 19. Grace Liu – Senior Product Designer at Microsoft
UPDATE candidates SET last_activity_action = 'Recruiter screen scheduled', last_activity_at = '2026-03-11T13:45:00Z',
work_history = '[
  {"company":"Microsoft","title":"Senior Product Designer","location":"Seattle, WA","start_date":"2022-04","end_date":null,"description":"Lead the Fluent 2 design system team, defining component standards used across Microsoft 365 products. Built token architecture enabling seamless theming across light, dark, and high-contrast modes."},
  {"company":"Shopify","title":"Product Designer","location":"Remote","start_date":"2020-06","end_date":"2022-03","description":"Designed the Polaris design system''s accessibility patterns. Led the initiative to achieve WCAG 2.1 AA compliance across all Shopify admin components."},
  {"company":"Etsy","title":"Product Designer","location":"Brooklyn, NY","start_date":"2019-01","end_date":"2020-05","description":"Designed search and discovery features for Etsy''s marketplace. Shipped a redesigned search results page that increased click-through rates by 12%."}
]'::jsonb,
education = '[
  {"school":"Carnegie Mellon University","degree":"M.Des.","field":"Interaction Design","start_year":2017,"end_year":2019},
  {"school":"University of Washington","degree":"B.S.","field":"Informatics","start_year":2013,"end_year":2017}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000019';

-- 20. Sophie Chen – Marketing Manager at HubSpot
UPDATE candidates SET last_activity_action = 'Take-home submitted', last_activity_at = '2026-03-10T08:30:00Z',
work_history = '[
  {"company":"HubSpot","title":"Marketing Manager, Growth","location":"San Francisco, CA","start_date":"2022-09","end_date":null,"description":"Own organic growth strategy driving 2M+ monthly blog visits. Launched a content-led SEO program that increased signups from organic search by 45% YoY."},
  {"company":"Mixpanel","title":"Content Marketing Manager","location":"San Francisco, CA","start_date":"2020-03","end_date":"2022-08","description":"Built the content marketing function from scratch. Grew the blog from 50K to 400K monthly visits through technical tutorials and data-driven content strategy."},
  {"company":"Buffer","title":"Marketing Coordinator","location":"Remote","start_date":"2018-06","end_date":"2020-02","description":"Managed social media scheduling and email campaigns. Wrote weekly blog posts on social media marketing best practices reaching 200K+ subscribers."}
]'::jsonb,
education = '[
  {"school":"Stanford University","degree":"M.A.","field":"Communication","start_year":2018,"end_year":2020},
  {"school":"UCLA","degree":"B.A.","field":"Communications","start_year":2014,"end_year":2018}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000020';

-- 21. Ethan Brooks – Content Marketing Manager at Contentful
UPDATE candidates SET last_activity_action = 'Submitted application', last_activity_at = '2026-03-09T12:00:00Z',
work_history = '[
  {"company":"Contentful","title":"Content Marketing Manager","location":"Denver, CO","start_date":"2023-04","end_date":null,"description":"Lead content strategy for developer-focused marketing. Produce technical blog posts, API tutorials, and case studies that generate 30% of marketing-qualified leads."},
  {"company":"Twilio","title":"Content Strategist","location":"Denver, CO","start_date":"2021-06","end_date":"2023-03","description":"Created technical content for Twilio''s developer audience including API documentation, quickstart guides, and blog posts. Managed a team of 3 freelance writers."}
]'::jsonb,
education = '[
  {"school":"Columbia University","degree":"M.A.","field":"Digital Media","start_year":2021,"end_year":2023},
  {"school":"University of Colorado Boulder","degree":"B.A.","field":"English Literature","start_year":2017,"end_year":2021}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000021';

-- 22. Hannah Wells – Senior Content Lead at Marketo
UPDATE candidates SET last_activity_action = 'Interview completed', last_activity_at = '2026-03-08T15:00:00Z',
work_history = '[
  {"company":"Marketo (Adobe)","title":"Senior Content Lead","location":"Austin, TX","start_date":"2022-01","end_date":null,"description":"Lead a team of 4 content marketers producing thought leadership, webinars, and gated assets. Content programs directly influenced $12M in pipeline in FY25."},
  {"company":"Drift","title":"Content Marketing Manager","location":"Boston, MA","start_date":"2019-08","end_date":"2021-12","description":"Built Drift''s conversational marketing content library. Launched a podcast that reached 50K monthly downloads within 6 months."},
  {"company":"Constant Contact","title":"Marketing Specialist","location":"Boston, MA","start_date":"2017-06","end_date":"2019-07","description":"Created email marketing campaigns and landing pages for SMB customers. Managed the editorial calendar for the company blog."}
]'::jsonb,
education = '[
  {"school":"Boston University","degree":"M.S.","field":"Journalism","start_year":2015,"end_year":2017},
  {"school":"University of Virginia","degree":"B.A.","field":"English","start_year":2011,"end_year":2015}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000022';

-- 23. Ryan O'Connor – Staff Writer at The Verge
UPDATE candidates SET last_activity_action = 'Scorecard submitted', last_activity_at = '2026-03-07T11:30:00Z',
work_history = '[
  {"company":"The Verge","title":"Staff Writer","location":"New York, NY","start_date":"2023-02","end_date":null,"description":"Cover enterprise technology, developer tools, and AI for The Verge. Published 150+ articles with an average of 80K pageviews each. Break news on product launches and industry trends."},
  {"company":"TechCrunch","title":"Contributing Writer","location":"New York, NY","start_date":"2021-09","end_date":"2023-01","description":"Wrote weekly columns on startup fundraising and SaaS trends. Conducted in-depth interviews with founders and VCs for feature stories."}
]'::jsonb,
education = '[
  {"school":"Columbia University","degree":"M.S.","field":"Journalism","start_year":2019,"end_year":2021},
  {"school":"NYU","degree":"B.A.","field":"English & Creative Writing","start_year":2015,"end_year":2019}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000023';

-- 24. Zoe Martinez – Head of Content at Notion
UPDATE candidates SET last_activity_action = 'Moved to final round', last_activity_at = '2026-03-06T16:00:00Z',
work_history = '[
  {"company":"Notion","title":"Head of Content","location":"San Francisco, CA","start_date":"2022-05","end_date":null,"description":"Built and lead a 6-person content team spanning blog, video, and community. Grew Notion''s YouTube channel from 20K to 350K subscribers. Content programs drove 25% of new user signups."},
  {"company":"Stripe","title":"Senior Content Strategist","location":"San Francisco, CA","start_date":"2020-01","end_date":"2022-04","description":"Led content strategy for Stripe Press and the company blog. Managed the production of long-form guides on internet economics read by 500K+ people annually."},
  {"company":"Medium","title":"Editorial Lead","location":"San Francisco, CA","start_date":"2018-03","end_date":"2019-12","description":"Curated and edited featured stories across technology and business verticals. Grew the technology section readership by 60%."}
]'::jsonb,
education = '[
  {"school":"Harvard University","degree":"M.A.","field":"Education Technology","start_year":2018,"end_year":2020},
  {"school":"UC Berkeley","degree":"B.A.","field":"Media Studies","start_year":2014,"end_year":2018}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000024';

-- 25. Isaac Lee – Technical Writer at Vercel
UPDATE candidates SET last_activity_action = 'Rejected', last_activity_at = '2026-03-05T09:45:00Z',
work_history = '[
  {"company":"Vercel","title":"Technical Writer","location":"Seattle, WA","start_date":"2024-01","end_date":null,"description":"Author and maintain Next.js documentation used by 1M+ developers monthly. Write migration guides, API references, and tutorials for new framework features."},
  {"company":"Stripe","title":"Technical Writer","location":"Seattle, WA","start_date":"2022-08","end_date":"2023-12","description":"Wrote API documentation and integration guides for Stripe Connect. Developed interactive code samples that reduced support tickets by 15%."}
]'::jsonb,
education = '[
  {"school":"MIT","degree":"M.S.","field":"Comparative Media Studies","start_year":2022,"end_year":2024},
  {"school":"University of Washington","degree":"B.A.","field":"Technical Communication","start_year":2019,"end_year":2022}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000025';

-- 26. Jane Warren – Senior Frontend Engineer at Vercel
UPDATE candidates SET last_activity_action = 'Interview scheduled', last_activity_at = '2026-04-20T10:00:00Z',
work_history = '[
  {"company":"Vercel","title":"Senior Frontend Engineer","location":"San Francisco, CA","start_date":"2023-01","end_date":null,"description":"Lead developer on the Next.js dashboard experience. Built the new deployment analytics UI and contributed to the Vercel design system."},
  {"company":"Stripe","title":"Frontend Engineer","location":"San Francisco, CA","start_date":"2020-06","end_date":"2022-12","description":"Developed Stripe Dashboard components used by millions of merchants. Led the migration from styled-components to Tailwind CSS."},
  {"company":"Airbnb","title":"Software Engineer","location":"San Francisco, CA","start_date":"2018-08","end_date":"2020-05","description":"Built search and booking UI components for the Airbnb web platform using React and TypeScript."}
]'::jsonb,
education = '[
  {"institution":"UC Berkeley","degree":"B.S. Computer Science","start_date":"2014-09","end_date":"2018-05"}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000026';

-- 27. Marco Alvarez – Staff Frontend Engineer at Shopify
UPDATE candidates SET last_activity_action = 'Interview scheduled', last_activity_at = '2026-04-22T11:00:00Z',
work_history = '[
  {"company":"Shopify","title":"Staff Frontend Engineer","location":"San Francisco, CA","start_date":"2022-03","end_date":null,"description":"Architect of Shopify''s micro-frontend platform powering the admin dashboard. Led migration from monolithic SPA to module federation, reducing deploy times by 60%. Mentors 4 frontend engineers."},
  {"company":"Square","title":"Senior Frontend Engineer","location":"San Francisco, CA","start_date":"2019-06","end_date":"2022-02","description":"Built the Square Dashboard component library and led frontend performance initiatives. Reduced bundle size by 45% through code splitting and tree shaking."},
  {"company":"Atlassian","title":"Frontend Engineer","location":"Sydney, Australia","start_date":"2017-01","end_date":"2019-05","description":"Developed Jira''s board view using React and TypeScript. Implemented drag-and-drop functionality and real-time collaboration features."}
]'::jsonb,
education = '[
  {"institution":"University of Melbourne","degree":"B.S. Software Engineering","start_date":"2013-02","end_date":"2016-11"}
]'::jsonb
WHERE id = 'c0000000-0000-0000-0000-000000000027';

-- ============================================================
-- Requisitions (5 reqs with stable UUIDs)
-- ============================================================
INSERT INTO requisitions (id, req_number, title, department, location, employment_type, recruiter_name, hiring_manager_name, status, description, requirements, salary_min, salary_max, headcount, location_pay_ranges) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    1000,
    'Senior Frontend Engineer',
    'Engineering',
    'San Francisco, New York, Remote',
    'full_time',
    'Taylor Brooks',
    'Sarah Chen',
    'open',
    E'## About Acme\nAcme is building the next generation of AI-powered developer tools. Our platform helps engineering teams ship faster with intelligent code assistance, automated testing, and real-time collaboration. Backed by top-tier investors, we''re growing rapidly and looking for exceptional people to join us.\n\n## About the role\nWe''re looking for a Senior Frontend Engineer to lead the development of our core product interfaces. You''ll work closely with design and product to craft polished, performant experiences used by thousands of developers every day. This is a high-impact role where you''ll shape both the technical architecture and the user experience of our flagship products.\n\n## What you''ll do\n- Own the frontend architecture for our main web application, built with React and TypeScript\n- Collaborate with designers to translate Figma specs into pixel-perfect, accessible components\n- Build and maintain a shared component library used across multiple product surfaces\n- Drive performance improvements and establish frontend best practices\n- Mentor junior engineers and contribute to technical design reviews\n- Partner with backend engineers to define API contracts and data models',
    ARRAY['5+ years of professional frontend development experience', 'Deep expertise in React, TypeScript, and modern CSS (Tailwind preferred)', 'Experience building and maintaining design systems or component libraries', 'Strong understanding of web performance, accessibility, and responsive design', 'Excellent communication skills and experience working in cross-functional teams', 'Experience with testing frameworks (Vitest, Playwright, or similar)'],
    180000, 240000, 1,
    '[{"location": "San Francisco", "min": 180000, "max": 240000}, {"location": "New York", "min": 170000, "max": 230000}, {"location": "Remote - US", "min": 160000, "max": 220000}]'::jsonb
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    1001,
    'Account Executive',
    'Sales',
    'Chicago, New York, Remote',
    'full_time',
    'Jordan Lee',
    'Diana Kim',
    'open',
    E'## About Acme\nAcme is building the next generation of AI-powered developer tools. Our platform helps engineering teams ship faster with intelligent code assistance, automated testing, and real-time collaboration. Backed by top-tier investors, we''re growing rapidly and looking for exceptional people to join us.\n\n## About the role\nWe''re hiring an Account Executive to drive new business across mid-market and enterprise accounts. You''ll be one of the first dedicated AEs on the team, with a huge opportunity to shape our go-to-market playbook and directly impact revenue growth. This role is ideal for someone who thrives in a fast-paced environment and loves selling technical products to engineering leaders.\n\n## What you''ll do\n- Own the full sales cycle from prospecting through close for mid-market and enterprise accounts\n- Build relationships with engineering leaders, CTOs, and VPs of Engineering\n- Partner with Solutions Engineering to deliver tailored product demos and technical deep-dives\n- Develop account strategies and maintain accurate forecasts in our CRM\n- Collaborate with Marketing on outbound campaigns and event strategy\n- Provide customer feedback to Product to inform the roadmap',
    ARRAY['3+ years of B2B SaaS sales experience, ideally selling to technical buyers', 'Proven track record of meeting or exceeding quota', 'Experience with consultative selling and managing complex deal cycles', 'Familiarity with developer tools, DevOps, or infrastructure products', 'Strong written and verbal communication skills', 'Self-starter mentality comfortable in an early-stage environment'],
    120000, 160000, 2,
    '[{"location": "Chicago", "min": 120000, "max": 160000}, {"location": "New York", "min": 130000, "max": 170000}, {"location": "Remote - US", "min": 110000, "max": 150000}]'::jsonb
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    1002,
    'Senior Product Designer',
    'Design',
    'San Francisco, New York',
    'full_time',
    'Taylor Brooks',
    'James Ortiz',
    'open',
    E'## About Acme\nAcme is building the next generation of AI-powered developer tools. Our platform helps engineering teams ship faster with intelligent code assistance, automated testing, and real-time collaboration. Backed by top-tier investors, we''re growing rapidly and looking for exceptional people to join us.\n\n## About the role\nWe''re looking for a Senior Product Designer to define the experience of our core platform. You''ll lead end-to-end design for complex workflows — from AI-assisted code review to real-time collaboration features. This is a foundational design role where you''ll set the standard for how developers interact with our tools.\n\n## What you''ll do\n- Lead design for key product areas, taking projects from discovery through ship\n- Conduct user research and usability testing with our developer audience\n- Create high-fidelity prototypes and detailed interaction specifications in Figma\n- Build and evolve our design system to ensure consistency across the product\n- Work closely with Engineering to ensure design intent is preserved in implementation\n- Present design work to leadership and incorporate feedback from stakeholders',
    ARRAY['5+ years of product design experience, with a portfolio demonstrating end-to-end design work', 'Deep proficiency in Figma including prototyping, components, and variables', 'Experience designing for developer tools, data-heavy interfaces, or B2B SaaS platforms', 'Strong systems thinking — ability to balance consistency with flexibility in a design system', 'Excellent communication and storytelling skills', 'Experience with user research methods and data-informed design decisions'],
    160000, 210000, 1,
    '[{"location": "San Francisco", "min": 160000, "max": 210000}, {"location": "New York", "min": 155000, "max": 205000}]'::jsonb
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    1003,
    'Machine Learning Engineer',
    'AI Research',
    'San Francisco, Bangalore, Remote',
    'full_time',
    'Taylor Brooks',
    'Sarah Chen',
    'open',
    E'## About Acme\nAcme is building the next generation of AI-powered developer tools. Our platform helps engineering teams ship faster with intelligent code assistance, automated testing, and real-time collaboration. Backed by top-tier investors, we''re growing rapidly and looking for exceptional people to join us.\n\n## About the role\nWe''re hiring a Machine Learning Engineer to work on the core AI models that power our product. You''ll develop and optimize large language models for code understanding, generation, and review. This role sits at the intersection of ML research and production engineering — you''ll prototype new model architectures and ship them to thousands of users.\n\n## What you''ll do\n- Train, fine-tune, and evaluate LLMs for code-related tasks\n- Build robust ML pipelines for data processing, training, and inference at scale\n- Collaborate with product teams to translate user needs into model capabilities\n- Optimize model performance for latency, cost, and quality\n- Stay current with the latest ML research and identify techniques applicable to our domain\n- Contribute to our evaluation frameworks and experimentation infrastructure',
    ARRAY['3+ years of experience in machine learning engineering or applied ML research', 'Hands-on experience with LLMs — fine-tuning, RLHF, prompt engineering, or inference optimization', 'Proficiency in Python, PyTorch, and distributed training frameworks', 'Experience building production ML systems with monitoring and observability', 'Strong fundamentals in statistics, linear algebra, and optimization', 'Published research or meaningful open-source contributions in ML are a plus'],
    175000, 280000, 1,
    '[{"location": "San Francisco", "min": 210000, "max": 280000}, {"location": "Bangalore", "min": 3500000, "max": 5500000}, {"location": "Remote - US", "min": 190000, "max": 260000}]'::jsonb
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    1004,
    'Content Marketing Lead',
    'Marketing',
    'Remote, San Francisco',
    'full_time',
    'Jordan Lee',
    'Ravi Gupta',
    'open',
    E'## About Acme\nAcme is building the next generation of AI-powered developer tools. Our platform helps engineering teams ship faster with intelligent code assistance, automated testing, and real-time collaboration. Backed by top-tier investors, we''re growing rapidly and looking for exceptional people to join us.\n\n## About the role\nWe''re looking for a Content Marketing Lead to own our content strategy from the ground up. You''ll create technical content that resonates with a developer audience — blog posts, tutorials, case studies, and thought leadership. This is a highly visible role where your work will directly drive awareness, signups, and community engagement.\n\n## What you''ll do\n- Define and execute a content strategy targeting software engineers and engineering leaders\n- Write and edit long-form technical blog posts, tutorials, and product announcements\n- Collaborate with Developer Relations to amplify community stories and use cases\n- Manage our editorial calendar and coordinate with cross-functional stakeholders\n- Analyze content performance and iterate based on engagement data\n- Build relationships with external writers and technical thought leaders for guest content',
    ARRAY['4+ years of content marketing experience, preferably in developer tools or B2B SaaS', 'Exceptional writing and editing skills with a portfolio of published technical content', 'Ability to distill complex technical concepts into clear, engaging narratives', 'Familiarity with SEO, content analytics, and distribution strategies', 'Experience working with or marketing to software developers', 'Self-directed with strong project management skills'],
    130000, 170000, 1,
    '[{"location": "San Francisco", "min": 140000, "max": 170000}, {"location": "Remote - US", "min": 130000, "max": 160000}]'::jsonb
  );

SELECT setval('req_number_seq', 1005);

-- ============================================================
-- Req stages (pipeline stages for each requisition)
-- ============================================================
-- Senior Frontend Engineer
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000001', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0001-000000000002', 'b0000000-0000-0000-0000-000000000001', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0001-000000000003', 'b0000000-0000-0000-0000-000000000001', 'screen', 'Hiring manager screen', 1),
  ('e0000000-0000-0000-0001-000000000004', 'b0000000-0000-0000-0000-000000000001', 'final_interview', 'Onsite', 0),
  ('e0000000-0000-0000-0001-000000000006', 'b0000000-0000-0000-0000-000000000001', 'final_interview', 'Reference check', 1),
  ('e0000000-0000-0000-0001-000000000005', 'b0000000-0000-0000-0000-000000000001', 'offer', 'Offer', 0);
-- Account Executive
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0002-000000000001', 'b0000000-0000-0000-0000-000000000002', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0002-000000000002', 'b0000000-0000-0000-0000-000000000002', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0002-000000000003', 'b0000000-0000-0000-0000-000000000002', 'screen', 'Hiring manager screen', 1),
  ('e0000000-0000-0000-0002-000000000004', 'b0000000-0000-0000-0000-000000000002', 'final_interview', 'Onsite', 0),
  ('e0000000-0000-0000-0002-000000000006', 'b0000000-0000-0000-0000-000000000002', 'final_interview', 'Reference check', 1),
  ('e0000000-0000-0000-0002-000000000005', 'b0000000-0000-0000-0000-000000000002', 'offer', 'Offer', 0);
-- Senior Product Designer
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0003-000000000001', 'b0000000-0000-0000-0000-000000000003', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0003-000000000002', 'b0000000-0000-0000-0000-000000000003', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0003-000000000003', 'b0000000-0000-0000-0000-000000000003', 'screen', 'Hiring manager screen', 1),
  ('e0000000-0000-0000-0003-000000000004', 'b0000000-0000-0000-0000-000000000003', 'final_interview', 'Onsite', 0),
  ('e0000000-0000-0000-0003-000000000006', 'b0000000-0000-0000-0000-000000000003', 'final_interview', 'Reference check', 1),
  ('e0000000-0000-0000-0003-000000000005', 'b0000000-0000-0000-0000-000000000003', 'offer', 'Offer', 0);
-- Machine Learning Engineer
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0004-000000000001', 'b0000000-0000-0000-0000-000000000004', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0004-000000000002', 'b0000000-0000-0000-0000-000000000004', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0004-000000000003', 'b0000000-0000-0000-0000-000000000004', 'screen', 'Hiring manager screen', 1),
  ('e0000000-0000-0000-0004-000000000004', 'b0000000-0000-0000-0000-000000000004', 'final_interview', 'Onsite', 0),
  ('e0000000-0000-0000-0004-000000000006', 'b0000000-0000-0000-0000-000000000004', 'final_interview', 'Reference check', 1),
  ('e0000000-0000-0000-0004-000000000005', 'b0000000-0000-0000-0000-000000000004', 'offer', 'Offer', 0);
-- Content Marketing Lead
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0005-000000000001', 'b0000000-0000-0000-0000-000000000005', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0005-000000000002', 'b0000000-0000-0000-0000-000000000005', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0005-000000000003', 'b0000000-0000-0000-0000-000000000005', 'screen', 'Hiring manager screen', 1),
  ('e0000000-0000-0000-0005-000000000004', 'b0000000-0000-0000-0000-000000000005', 'final_interview', 'Onsite', 0),
  ('e0000000-0000-0000-0005-000000000006', 'b0000000-0000-0000-0000-000000000005', 'final_interview', 'Reference check', 1),
  ('e0000000-0000-0000-0005-000000000005', 'b0000000-0000-0000-0000-000000000005', 'offer', 'Offer', 0);

-- ============================================================
-- Req interviews (interview plan per stage)
-- ============================================================
-- Senior Frontend Engineer
INSERT INTO req_interviews (id, req_id, stage_id, title, interview_type, duration_minutes, interviewer_name, order_position) VALUES
  ('f0000000-0000-0001-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000002', 'Recruiter screen',               'standard',        30, 'Taylor Brooks',                 0),
  ('f0000000-0000-0001-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000003', 'Hiring manager screen',          'standard',        45, 'Sarah Chen',                    0),
  ('f0000000-0000-0001-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000004', 'System Design',                  'technical',       60, 'Jerome Bell, Marvin McKinney',  0),
  ('f0000000-0000-0001-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000004', 'Algorithms and Data Structures', 'technical',       45, 'Javier Ramirez',                1),
  ('f0000000-0000-0001-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000004', 'Break',                          'other',           15, NULL,                            2),
  ('f0000000-0000-0001-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000004', 'Culture Fit',                    'behavioral',      30, 'Cameron Williamson',            3),
  ('f0000000-0000-0001-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000004', 'Hiring Manager Close-up',        'behavioral',      30, 'Leslie Alexander',              4),
  ('f0000000-0000-0001-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0001-000000000006', 'Reference check debrief',        'reference_check', 30, 'Taylor Brooks',                 0);
-- Account Executive
INSERT INTO req_interviews (id, req_id, stage_id, title, interview_type, duration_minutes, interviewer_name, order_position) VALUES
  ('f0000000-0000-0002-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000002', 'Recruiter screen',               'standard',        30, 'Jordan Lee',                    0),
  ('f0000000-0000-0002-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000003', 'Hiring manager screen',          'standard',        45, 'Diana Kim',                     0),
  ('f0000000-0000-0002-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000004', 'System Design',                  'technical',       60, 'Jerome Bell, Marvin McKinney',  0),
  ('f0000000-0000-0002-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000004', 'Algorithms and Data Structures', 'technical',       45, 'Javier Ramirez',                1),
  ('f0000000-0000-0002-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000004', 'Break',                          'other',           15, NULL,                            2),
  ('f0000000-0000-0002-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000004', 'Culture Fit',                    'behavioral',      30, 'Cameron Williamson',            3),
  ('f0000000-0000-0002-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000004', 'Hiring Manager Close-up',        'behavioral',      30, 'Leslie Alexander',              4),
  ('f0000000-0000-0002-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0002-000000000006', 'Reference check debrief',        'reference_check', 30, 'Jordan Lee',                    0);
-- Senior Product Designer
INSERT INTO req_interviews (id, req_id, stage_id, title, interview_type, duration_minutes, interviewer_name, order_position) VALUES
  ('f0000000-0000-0003-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000002', 'Recruiter screen',               'standard',        30, 'Taylor Brooks',                 0),
  ('f0000000-0000-0003-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000003', 'Hiring manager screen',          'standard',        45, 'James Ortiz',                   0),
  ('f0000000-0000-0003-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000004', 'System Design',                  'technical',       60, 'Jerome Bell, Marvin McKinney',  0),
  ('f0000000-0000-0003-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000004', 'Algorithms and Data Structures', 'technical',       45, 'Javier Ramirez',                1),
  ('f0000000-0000-0003-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000004', 'Break',                          'other',           15, NULL,                            2),
  ('f0000000-0000-0003-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000004', 'Culture Fit',                    'behavioral',      30, 'Cameron Williamson',            3),
  ('f0000000-0000-0003-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000004', 'Hiring Manager Close-up',        'behavioral',      30, 'Leslie Alexander',              4),
  ('f0000000-0000-0003-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0003-000000000006', 'Reference check debrief',        'reference_check', 30, 'Taylor Brooks',                 0);
-- Machine Learning Engineer
INSERT INTO req_interviews (id, req_id, stage_id, title, interview_type, duration_minutes, interviewer_name, order_position) VALUES
  ('f0000000-0000-0004-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000002', 'Recruiter screen',               'standard',        30, 'Taylor Brooks',                 0),
  ('f0000000-0000-0004-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000003', 'Hiring manager screen',          'standard',        45, 'Sarah Chen',                    0),
  ('f0000000-0000-0004-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000004', 'System Design',                  'technical',       60, 'Jerome Bell, Marvin McKinney',  0),
  ('f0000000-0000-0004-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000004', 'Algorithms and Data Structures', 'technical',       45, 'Javier Ramirez',                1),
  ('f0000000-0000-0004-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000004', 'Break',                          'other',           15, NULL,                            2),
  ('f0000000-0000-0004-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000004', 'Culture Fit',                    'behavioral',      30, 'Cameron Williamson',            3),
  ('f0000000-0000-0004-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000004', 'Hiring Manager Close-up',        'behavioral',      30, 'Leslie Alexander',              4),
  ('f0000000-0000-0004-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0004-000000000006', 'Reference check debrief',        'reference_check', 30, 'Taylor Brooks',                 0);
-- Content Marketing Lead
INSERT INTO req_interviews (id, req_id, stage_id, title, interview_type, duration_minutes, interviewer_name, order_position) VALUES
  ('f0000000-0000-0005-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000002', 'Recruiter screen',               'standard',        30, 'Jordan Lee',                    0),
  ('f0000000-0000-0005-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000003', 'Hiring manager screen',          'standard',        45, 'Ravi Gupta',                    0),
  ('f0000000-0000-0005-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000004', 'System Design',                  'technical',       60, 'Jerome Bell, Marvin McKinney',  0),
  ('f0000000-0000-0005-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000004', 'Algorithms and Data Structures', 'technical',       45, 'Javier Ramirez',                1),
  ('f0000000-0000-0005-0000-000000000008', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000004', 'Break',                          'other',           15, NULL,                            2),
  ('f0000000-0000-0005-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000004', 'Culture Fit',                    'behavioral',      30, 'Cameron Williamson',            3),
  ('f0000000-0000-0005-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000004', 'Hiring Manager Close-up',        'behavioral',      30, 'Leslie Alexander',              4),
  ('f0000000-0000-0005-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0005-000000000006', 'Reference check debrief',        'reference_check', 30, 'Jordan Lee',                    0);

-- ============================================================
-- Applications (each req gets 4-6 candidates at various stages)
-- ============================================================
-- Senior Frontend Engineer (7 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-02-10', 'referral',     'final_interview', 'e0000000-0000-0000-0001-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '2026-02-12', 'referral',     'screen',          'e0000000-0000-0000-0001-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', '2026-02-15', 'linkedin',     'offer',           'e0000000-0000-0000-0001-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', '2026-02-18', 'careers_page', 'screen',          'e0000000-0000-0000-0001-000000000002', 'active'),
  ('c0000000-0000-0000-0000-000000000026', 'b0000000-0000-0000-0000-000000000001', '2026-02-14', 'referral',     'final_interview', 'e0000000-0000-0000-0001-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000027', 'b0000000-0000-0000-0000-000000000001', '2026-02-16', 'linkedin',     'final_interview', 'e0000000-0000-0000-0001-000000000004', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', '2026-02-20', 'careers_page', 'application',     'e0000000-0000-0000-0001-000000000001', 'rejected', 'Not enough experience with design systems');

-- Account Executive (5 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', '2026-02-05', 'linkedin',     'screen',          'e0000000-0000-0000-0002-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000002', '2026-02-08', 'linkedin',     'screen',          'e0000000-0000-0000-0002-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000002', '2026-02-10', 'agency',       'offer',           'e0000000-0000-0000-0002-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000002', '2026-02-14', 'referral',     'screen',          'e0000000-0000-0000-0002-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, withdrawn_reason) VALUES
  ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000002', '2026-02-20', 'linkedin',     'application',     'e0000000-0000-0000-0002-000000000001', 'withdrawn', 'Accepted another offer');

-- Senior Product Designer (5 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000003', '2026-02-01', 'referral',     'final_interview', 'e0000000-0000-0000-0003-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000003', '2026-02-03', 'linkedin',     'offer',           'e0000000-0000-0000-0003-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000003', '2026-02-10', 'referral',     'screen',          'e0000000-0000-0000-0003-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000003', '2026-02-15', 'linkedin',     'screen',          'e0000000-0000-0000-0003-000000000003', 'rejected', 'Looking for more hands-on IC work');

-- Data Engineer (4 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', '2026-02-12', 'linkedin',     'final_interview', 'e0000000-0000-0000-0004-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', '2026-02-14', 'linkedin',     'screen',          'e0000000-0000-0000-0004-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000004', '2026-02-18', 'referral',     'screen',          'e0000000-0000-0000-0004-000000000002', 'active'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000004', '2026-02-22', 'agency',       'offer',           'e0000000-0000-0000-0004-000000000005', 'active');

-- Content Marketing Lead (6 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000005', '2026-02-08', 'referral',     'final_interview', 'e0000000-0000-0000-0005-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000005', '2026-02-10', 'linkedin',     'screen',          'e0000000-0000-0000-0005-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000005', '2026-02-12', 'referral',     'offer',           'e0000000-0000-0000-0005-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000005', '2026-02-15', 'careers_page', 'screen',          'e0000000-0000-0000-0005-000000000002', 'active'),
  ('c0000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000005', '2026-02-22', 'linkedin',     'application',     'e0000000-0000-0000-0005-000000000001', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000005', '2026-02-18', 'agency',       'screen',          'e0000000-0000-0000-0005-000000000003', 'rejected', 'Salary expectations above range');

-- ============================================================
-- Cross-applications (candidates applying to multiple reqs)
-- ============================================================

-- Additional → Senior Frontend Engineer
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000001', '2026-02-08', 'linkedin',     'screen',          'e0000000-0000-0000-0001-000000000003', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '2026-01-28', 'careers_page', 'application',     'e0000000-0000-0000-0001-000000000001', 'rejected', 'Looking for candidates with stronger frontend experience'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', '2026-02-28', 'linkedin',     'application',     'e0000000-0000-0000-0001-000000000001', 'rejected', 'Profile focused on data engineering rather than frontend'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', '2026-02-25', 'careers_page', 'application',     'e0000000-0000-0000-0001-000000000001', 'rejected', 'Backend-focused; insufficient frontend depth'),
  ('c0000000-0000-0000-0000-000000000025', 'b0000000-0000-0000-0000-000000000001', '2026-02-19', 'linkedin',     'application',     'e0000000-0000-0000-0001-000000000001', 'rejected', 'Technical writing focus; need stronger engineering background');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, withdrawn_reason) VALUES
  ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000001', '2026-02-06', 'linkedin',     'screen',          'e0000000-0000-0000-0001-000000000002', 'withdrawn', 'Decided to focus on design opportunities');

-- Additional → Account Executive
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000002', '2026-02-11', 'referral',     'screen',          'e0000000-0000-0000-0002-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000002', '2026-02-16', 'linkedin',     'screen',          'e0000000-0000-0000-0002-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', '2026-02-14', 'linkedin',     'screen',          'e0000000-0000-0000-0002-000000000002', 'rejected', 'Technical background doesn''t align with sales role'),
  ('c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000002', '2026-02-18', 'careers_page', 'application',     'e0000000-0000-0000-0002-000000000001', 'rejected', 'No direct sales closing experience');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, withdrawn_reason) VALUES
  ('c0000000-0000-0000-0000-000000000024', 'b0000000-0000-0000-0000-000000000002', '2026-02-24', 'linkedin',     'application',     'e0000000-0000-0000-0002-000000000001', 'withdrawn', 'Pursuing content-focused roles instead');

-- Additional → Senior Product Designer
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', '2026-01-30', 'referral',     'screen',          'e0000000-0000-0000-0003-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000003', '2026-02-12', 'careers_page', 'screen',          'e0000000-0000-0000-0003-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', '2026-02-22', 'referral',     'application',     'e0000000-0000-0000-0003-000000000001', 'rejected', 'Engineering background; looking for dedicated design experience'),
  ('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000003', '2026-02-03', 'linkedin',     'application',     'e0000000-0000-0000-0003-000000000001', 'rejected', 'Marketing background; need hands-on design experience'),
  ('c0000000-0000-0000-0000-000000000023', 'b0000000-0000-0000-0000-000000000003', '2026-02-22', 'careers_page', 'application',     'e0000000-0000-0000-0003-000000000001', 'rejected', 'No design portfolio or tool proficiency');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, withdrawn_reason) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', '2026-02-20', 'careers_page', 'application',     'e0000000-0000-0000-0003-000000000001', 'withdrawn', 'Decided to stay focused on engineering roles');

-- Additional → Machine Learning Engineer
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', '2026-02-18', 'referral',     'screen',          'e0000000-0000-0000-0004-000000000002', 'active'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', '2026-02-22', 'linkedin',     'screen',          'e0000000-0000-0000-0004-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000004', '2026-02-16', 'linkedin',     'screen',          'e0000000-0000-0000-0004-000000000002', 'active');

-- Additional → Content Marketing Lead
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000005', '2026-02-15', 'linkedin',     'screen',          'e0000000-0000-0000-0005-000000000002', 'active'),
  ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000005', '2026-02-17', 'referral',     'screen',          'e0000000-0000-0000-0005-000000000002', 'active'),
  ('c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000005', '2026-02-14', 'referral',     'screen',          'e0000000-0000-0000-0005-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000005', '2026-02-14', 'careers_page', 'screen',          'e0000000-0000-0000-0005-000000000003', 'rejected', 'Analytics skills strong but content quality didn''t meet the bar'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000005', '2026-02-25', 'careers_page', 'application',     'e0000000-0000-0000-0005-000000000001', 'rejected', 'Strong UX skills but limited content marketing experience'),
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000005', '2026-02-22', 'linkedin',     'application',     'e0000000-0000-0000-0005-000000000001', 'rejected', 'No content marketing or writing background'),
  ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000005', '2026-02-24', 'agency',       'application',     'e0000000-0000-0000-0005-000000000001', 'rejected', 'Sales background doesn''t align with content marketing');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, withdrawn_reason) VALUES
  ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000005', '2026-02-18', 'linkedin',     'application',     'e0000000-0000-0000-0005-000000000001', 'withdrawn', 'Accepted another offer');

-- ============================================================
-- Extra application-review candidates (populate the Inbox board)
-- ============================================================

-- Senior Frontend Engineer (b001) — app-review stage e…01-…001
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', '2026-04-20', 'linkedin',     'application', 'e0000000-0000-0000-0001-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000001', '2026-04-22', 'careers_page', 'application', 'e0000000-0000-0000-0001-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000001', '2026-04-24', 'referral',     'application', 'e0000000-0000-0000-0001-000000000001', 'active');

-- Account Executive (b002) — app-review stage e…02-…001
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', '2026-04-18', 'linkedin',     'application', 'e0000000-0000-0000-0002-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000002', '2026-04-21', 'careers_page', 'application', 'e0000000-0000-0000-0002-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000002', '2026-04-23', 'referral',     'application', 'e0000000-0000-0000-0002-000000000001', 'active');

-- Senior Product Designer (b003) — app-review stage e…03-…001
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', '2026-04-19', 'linkedin',     'application', 'e0000000-0000-0000-0003-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000003', '2026-04-22', 'referral',     'application', 'e0000000-0000-0000-0003-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000003', '2026-04-25', 'linkedin',     'application', 'e0000000-0000-0000-0003-000000000001', 'active');

-- Machine Learning Engineer (b004) — app-review stage e…04-…001
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', '2026-04-17', 'referral',     'application', 'e0000000-0000-0000-0004-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000004', '2026-04-20', 'linkedin',     'application', 'e0000000-0000-0000-0004-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000004', '2026-04-23', 'careers_page', 'application', 'e0000000-0000-0000-0004-000000000001', 'active');

-- Content Marketing Lead (b005) — app-review stage e…05-…001 (Isaac Lee already here)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', '2026-04-19', 'referral',     'application', 'e0000000-0000-0000-0005-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000005', '2026-04-22', 'linkedin',     'application', 'e0000000-0000-0000-0005-000000000001', 'active'),
  ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000005', '2026-04-24', 'careers_page', 'application', 'e0000000-0000-0000-0005-000000000001', 'active');

-- ============================================================
-- Candidate pools
-- ============================================================
INSERT INTO candidate_pools (id, name) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Design engineering'),
  ('d0000000-0000-0000-0000-000000000002', 'Product designer'),
  ('d0000000-0000-0000-0000-000000000003', 'Product managers');

INSERT INTO candidate_pool_members (pool_id, candidate_id) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004'),
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000019'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000016'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000017'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000018'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000020'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000021');

-- ============================================================
-- Req ↔ Candidate pool links
-- ============================================================
INSERT INTO req_candidate_pools (req_id, pool_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002');

-- ============================================================
-- Headcount planning: departments
-- ============================================================
INSERT INTO hc_departments (name, current_headcount, planned_headcount, open_positions, filled_positions, budget_allocated, budget_spent) VALUES
  ('Engineering', 42, 58, 8, 8, 2400000, 1680000),
  ('Product', 12, 16, 3, 1, 680000, 170000),
  ('Design', 8, 12, 2, 2, 420000, 280000),
  ('Sales', 24, 32, 5, 3, 1100000, 495000),
  ('Marketing', 10, 14, 2, 2, 560000, 280000),
  ('Customer Success', 15, 20, 3, 2, 720000, 384000);

-- ============================================================
-- Headcount planning: positions
-- ============================================================
INSERT INTO hc_positions (position_id, title, department, level, position_type, hiring_manager, target_date, location, employment_type, cost_center, salary_min, salary_max, priority, in_plan) VALUES
  ('PID-001', 'Senior Frontend Engineer', 'Engineering', 'L5', 'open', 'Sarah Chen', '2026-04-15', 'San Francisco', 'full_time', 'ENG-100', 180000, 240000, 'high', true),
  ('PID-002', 'Staff Backend Engineer', 'Engineering', 'L6', 'in_progress', 'Marcus Reeves', '2026-05-01', 'San Francisco', 'full_time', 'ENG-100', 220000, 300000, 'high', true),
  ('PID-009', 'Data Engineer', 'Engineering', 'L5', 'open', 'Sarah Chen', '2026-06-01', 'Remote', 'full_time', 'ENG-100', 175000, 235000, 'high', true),
  ('PID-010', 'iOS Engineer', 'Engineering', 'L4', 'in_progress', 'Marcus Reeves', '2026-05-15', 'San Francisco', 'full_time', 'ENG-100', 155000, 210000, 'medium', true),
  ('PID-011', 'DevOps Engineer', 'Engineering', 'L4', 'filled', 'Sarah Chen', '2026-03-01', 'Remote', 'contract', 'ENG-100', 140000, 180000, 'medium', true),
  ('PID-017', 'Engineering Intern', 'Engineering', 'L1', 'filled', 'Marcus Reeves', '2026-02-01', 'San Francisco', 'intern', 'ENG-100', 60000, 80000, 'low', false),
  ('PID-019', 'Backend Engineer', 'Engineering', 'L4', 'filled', 'Sarah Chen', '2026-01-15', 'San Francisco', 'full_time', 'ENG-100', 150000, 200000, 'medium', true),
  ('PID-020', 'QA Engineer', 'Engineering', 'L3', 'filled', 'Marcus Reeves', '2026-02-15', 'Remote', 'full_time', 'ENG-100', 110000, 145000, 'medium', false),
  ('PID-003', 'Product Manager, Growth', 'Product', 'L5', 'in_progress', 'Aisha Patel', '2026-03-30', 'San Francisco', 'full_time', 'PRD-200', 170000, 230000, 'high', true),
  ('PID-012', 'Product Analyst', 'Product', 'L3', 'open', 'Aisha Patel', '2026-05-01', 'San Francisco', 'full_time', 'PRD-200', 110000, 145000, 'low', true),
  ('PID-021', 'Senior Product Manager, Platform', 'Product', 'L6', 'filled', 'Aisha Patel', '2026-01-20', 'San Francisco', 'full_time', 'PRD-200', 200000, 270000, 'high', true),
  ('PID-004', 'Senior Product Designer', 'Design', 'L5', 'filled', 'James Ortiz', '2026-02-28', 'New York', 'full_time', 'DSG-300', 160000, 210000, 'medium', true),
  ('PID-013', 'UX Researcher', 'Design', 'L4', 'in_progress', 'James Ortiz', '2026-06-01', 'New York', 'full_time', 'DSG-300', 130000, 175000, 'medium', true),
  ('PID-005', 'Account Executive', 'Sales', 'L4', 'open', 'Diana Kim', '2026-04-15', 'Chicago', 'full_time', 'SAL-400', 120000, 160000, 'medium', true),
  ('PID-006', 'Enterprise AE', 'Sales', 'L5', 'in_progress', 'Diana Kim', '2026-03-31', 'New York', 'full_time', 'SAL-400', 150000, 200000, 'high', true),
  ('PID-014', 'SDR', 'Sales', 'L3', 'open', 'Diana Kim', '2026-04-01', 'Chicago', 'full_time', 'SAL-400', 65000, 85000, 'high', true),
  ('PID-018', 'Solutions Architect', 'Sales', 'L5', 'filled', 'Diana Kim', '2026-01-31', 'Remote', 'full_time', 'SAL-400', 170000, 230000, 'medium', true),
  ('PID-007', 'Content Marketing Lead', 'Marketing', 'L5', 'open', 'Ravi Gupta', '2026-05-15', 'Remote', 'full_time', 'MKT-500', 130000, 170000, 'medium', true),
  ('PID-015', 'Growth Marketing Manager', 'Marketing', 'L4', 'in_progress', 'Ravi Gupta', '2026-05-01', 'Remote', 'full_time', 'MKT-500', 120000, 155000, 'medium', true),
  ('PID-008', 'Customer Success Manager', 'Customer Success', 'L4', 'filled', 'Lena Torres', '2026-01-31', 'Austin', 'full_time', 'CSS-600', 110000, 145000, 'medium', true),
  ('PID-016', 'Customer Support Specialist', 'Customer Success', 'L3', 'open', 'Lena Torres', '2026-04-15', 'Austin', 'full_time', 'CSS-600', 70000, 95000, 'low', true),
  ('PID-027', 'Onboarding Specialist', 'Customer Success', 'L3', 'in_progress', 'Lena Torres', '2026-04-01', 'Austin', 'full_time', 'CSS-600', 75000, 100000, 'medium', true);

-- ============================================================
-- Headcount planning: employees
-- ============================================================
INSERT INTO hc_employees (name, title, department, level, location, employment_type, start_date, status, is_direct_report) VALUES
  ('Sarah Chen', 'Engineering Manager', 'Engineering', 'L6', 'San Francisco', 'full_time', '2023-03-15', 'active', true),
  ('Marcus Reeves', 'Senior Backend Engineer', 'Engineering', 'L5', 'San Francisco', 'full_time', '2023-06-01', 'active', true),
  ('Ana Kowalski', 'Frontend Engineer', 'Engineering', 'L4', 'New York', 'full_time', '2024-01-10', 'active', false),
  ('David Park', 'DevOps Engineer', 'Engineering', 'L4', 'Remote', 'full_time', '2024-03-01', 'active', false),
  ('Tom Nguyen', 'QA Engineer', 'Engineering', 'L3', 'Remote', 'contractor', '2024-06-01', 'active', false),
  ('Aisha Patel', 'Product Manager, Growth', 'Product', 'L5', 'San Francisco', 'full_time', '2024-01-15', 'active', true),
  ('Chris Donovan', 'Senior Product Manager, Platform', 'Product', 'L6', 'San Francisco', 'full_time', '2026-01-20', 'active', false),
  ('James Ortiz', 'Senior Product Designer', 'Design', 'L5', 'New York', 'full_time', '2023-09-01', 'active', true),
  ('Diana Kim', 'Sales Director', 'Sales', 'L6', 'Chicago', 'full_time', '2023-04-01', 'active', true),
  ('Ravi Gupta', 'Marketing Manager', 'Marketing', 'L5', 'Remote', 'full_time', '2024-02-01', 'active', true),
  ('Lena Torres', 'Customer Success Lead', 'Customer Success', 'L5', 'Austin', 'full_time', '2023-11-01', 'on_leave', true);

-- ============================================================
-- Headcount planning: scenarios + positions
-- ============================================================
INSERT INTO hc_scenarios (id, name, description, requested_by, status, in_plan) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Q3 Engineering Expansion', 'Hire 3 engineers to support the Q3 product launch.', 'Sarah Chen', 'pending', false),
  ('a0000000-0000-0000-0000-000000000002', 'Sales Team Scale-Up', 'Add 2 sales roles to expand enterprise coverage.', 'Diana Kim', 'approved', true),
  ('a0000000-0000-0000-0000-000000000003', 'Design Team Growth', 'Bring on a design manager and a motion designer.', 'James Ortiz', 'pending', false),
  ('a0000000-0000-0000-0000-000000000004', 'Customer Success Backfill', 'Replace departing CSM and add a support engineer.', 'Lena Torres', 'approved', false),
  ('a0000000-0000-0000-0000-000000000005', 'APAC Market Entry', 'Build an initial team for the Asia-Pacific market expansion.', 'Diana Kim', 'pending', false),
  ('a0000000-0000-0000-0000-000000000006', 'Data Platform Team', 'Create a dedicated data engineering team for analytics infrastructure.', 'Sarah Chen', 'rejected', false),
  ('a0000000-0000-0000-0000-000000000007', 'Marketing Rebrand Support', 'Temporary contractor support for the Q2 rebrand initiative.', 'Ravi Gupta', 'approved', true);

INSERT INTO hc_scenario_positions (scenario_id, title, department, level, location, employment_type, cost_center, salary_min, salary_max, priority, hiring_manager, target_date) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Senior ML Engineer', 'Engineering', 'L5', 'Remote', 'full_time', 'ENG-100', 190000, 260000, 'high', 'Sarah Chen', '2026-07-01'),
  ('a0000000-0000-0000-0000-000000000001', 'Platform Engineer', 'Engineering', 'L4', 'San Francisco', 'full_time', 'ENG-100', 160000, 215000, 'high', 'Sarah Chen', '2026-07-15'),
  ('a0000000-0000-0000-0000-000000000001', 'Security Engineer', 'Engineering', 'L5', 'Remote', 'full_time', 'ENG-100', 180000, 245000, 'medium', 'Marcus Reeves', '2026-08-01'),
  ('a0000000-0000-0000-0000-000000000002', 'Enterprise Account Executive', 'Sales', 'L5', 'New York', 'full_time', 'SAL-400', 150000, 200000, 'high', 'Diana Kim', '2026-06-01'),
  ('a0000000-0000-0000-0000-000000000002', 'Sales Engineer', 'Sales', 'L4', 'Chicago', 'full_time', 'SAL-400', 140000, 185000, 'medium', 'Diana Kim', '2026-06-15'),
  ('a0000000-0000-0000-0000-000000000003', 'Design Manager', 'Design', 'L6', 'New York', 'full_time', 'DSG-300', 190000, 250000, 'high', 'James Ortiz', '2026-07-01'),
  ('a0000000-0000-0000-0000-000000000003', 'Motion Designer', 'Design', 'L4', 'Remote', 'full_time', 'DSG-300', 120000, 160000, 'medium', 'James Ortiz', '2026-07-15'),
  ('a0000000-0000-0000-0000-000000000004', 'Customer Success Manager', 'Customer Success', 'L4', 'Austin', 'full_time', 'CSS-600', 110000, 145000, 'high', 'Lena Torres', '2026-06-01'),
  ('a0000000-0000-0000-0000-000000000004', 'Support Engineer', 'Customer Success', 'L3', 'Remote', 'full_time', 'CSS-600', 90000, 120000, 'medium', 'Lena Torres', '2026-06-15'),
  ('a0000000-0000-0000-0000-000000000005', 'APAC Sales Director', 'Sales', 'L6', 'Singapore', 'full_time', 'SAL-400', 200000, 280000, 'high', 'Diana Kim', '2026-09-01'),
  ('a0000000-0000-0000-0000-000000000005', 'APAC Account Executive', 'Sales', 'L4', 'Singapore', 'full_time', 'SAL-400', 120000, 165000, 'high', 'Diana Kim', '2026-09-15'),
  ('a0000000-0000-0000-0000-000000000005', 'APAC Customer Success Manager', 'Customer Success', 'L4', 'Singapore', 'full_time', 'CSS-600', 100000, 140000, 'medium', 'Lena Torres', '2026-10-01'),
  ('a0000000-0000-0000-0000-000000000006', 'Senior Data Engineer', 'Engineering', 'L5', 'Remote', 'full_time', 'ENG-100', 180000, 240000, 'high', 'Sarah Chen', '2026-08-01'),
  ('a0000000-0000-0000-0000-000000000006', 'Data Analyst', 'Engineering', 'L3', 'San Francisco', 'full_time', 'ENG-100', 110000, 145000, 'medium', 'Sarah Chen', '2026-08-15'),
  ('a0000000-0000-0000-0000-000000000007', 'Freelance Copywriter', 'Marketing', 'L4', 'Remote', 'contract', 'MKT-500', 80000, 110000, 'medium', 'Ravi Gupta', '2026-04-01'),
  ('a0000000-0000-0000-0000-000000000007', 'Brand Campaign Manager', 'Marketing', 'L4', 'New York', 'contract', 'MKT-500', 95000, 125000, 'medium', 'Ravi Gupta', '2026-04-15');

-- ============================================================
-- Headcount planning: plan settings
-- ============================================================
INSERT INTO hc_plan_settings (plan_name, collaborators, archived, plan_locked) VALUES
  ('AOP 2026', ARRAY['Sarah Chen','Diana Kim','Aisha Patel','Ravi Gupta'], false, false);

-- ============================================================
-- Headcount planning: approval requests
-- ============================================================
INSERT INTO hc_approval_requests (request_id, position, department, requested_by, submitted_date, status) VALUES
  ('REQ-101', 'Staff Backend Engineer', 'Engineering', 'Sarah Chen', '2026-02-28', 'pending'),
  ('REQ-102', 'Product Manager, Growth', 'Product', 'Aisha Patel', '2026-03-01', 'pending'),
  ('REQ-098', 'Senior Product Designer', 'Design', 'James Ortiz', '2026-02-15', 'approved'),
  ('REQ-095', 'Enterprise AE', 'Sales', 'Diana Kim', '2026-02-10', 'approved'),
  ('REQ-093', 'Data Analyst', 'Engineering', 'Marcus Reeves', '2026-02-05', 'rejected'),
  ('REQ-103', 'Content Marketing Lead', 'Marketing', 'Ravi Gupta', '2026-03-03', 'pending'),
  ('REQ-104', 'SDR', 'Sales', 'Diana Kim', '2026-03-04', 'approved'),
  ('REQ-105', 'UX Researcher', 'Design', 'James Ortiz', '2026-03-05', 'pending'),
  ('REQ-106', 'Infrastructure Engineer', 'Engineering', 'Sarah Chen', '2026-03-06', 'pending'),
  ('REQ-107', 'Onboarding Specialist', 'Customer Success', 'Lena Torres', '2026-03-07', 'approved');

-- ============================================================
-- Assessment criteria for all requisitions
-- ============================================================
UPDATE requisitions SET assessment_criteria = ARRAY[
  '5+ years of professional frontend development experience',
  'Deep expertise in React, TypeScript, and modern CSS',
  'Experience building design systems or component libraries',
  'Strong understanding of web performance and accessibility',
  'Experience mentoring engineers or leading technical initiatives'
] WHERE id = 'b0000000-0000-0000-0000-000000000001';

UPDATE requisitions SET assessment_criteria = ARRAY[
  '3+ years of B2B SaaS sales experience selling to technical buyers',
  'Proven track record of meeting or exceeding quota',
  'Experience with consultative selling and complex deal cycles',
  'Familiarity with developer tools or infrastructure products',
  'Self-starter comfortable in an early-stage environment'
] WHERE id = 'b0000000-0000-0000-0000-000000000002';

UPDATE requisitions SET assessment_criteria = ARRAY[
  '5+ years of product design experience with end-to-end portfolio',
  'Deep proficiency in Figma including prototyping and components',
  'Experience designing for developer tools or B2B SaaS platforms',
  'Strong systems thinking for design system work',
  'Experience with user research methods and data-informed design'
] WHERE id = 'b0000000-0000-0000-0000-000000000003';

UPDATE requisitions SET assessment_criteria = ARRAY[
  '3+ years of ML engineering or applied ML research experience',
  'Hands-on experience with LLMs including fine-tuning or inference optimization',
  'Proficiency in Python, PyTorch, and distributed training frameworks',
  'Experience building production ML systems with monitoring',
  'Strong fundamentals in statistics and optimization'
] WHERE id = 'b0000000-0000-0000-0000-000000000004';

UPDATE requisitions SET assessment_criteria = ARRAY[
  '4+ years of content marketing experience in developer tools or B2B SaaS',
  'Exceptional writing skills with published technical content portfolio',
  'Ability to distill complex technical concepts into clear narratives',
  'Familiarity with SEO, content analytics, and distribution strategies',
  'Experience marketing to software developers'
] WHERE id = 'b0000000-0000-0000-0000-000000000005';

-- ============================================================
-- Criteria evaluations (seeded for all reqs with active candidates)
-- ============================================================
INSERT INTO criteria_evaluations (req_id, candidate_id, criterion, met, reasoning) VALUES
  -- ── Senior Frontend Engineer (b001) ──
  -- c001: Liam Chen – Senior Frontend Engineer at Vercel
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '5+ years of professional frontend development experience', true, 'Has 8 years of frontend experience across Vercel, Stripe, and Airbnb.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Core stack at Vercel and Stripe. Built with React, TypeScript, and Tailwind daily.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Experience building design systems or component libraries', true, 'Built and maintained Vercel''s shared component library used across multiple products.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Strong understanding of web performance and accessibility', true, 'Led performance optimization initiatives and implemented WCAG 2.1 compliance at Stripe.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Experience mentoring engineers or leading technical initiatives', true, 'Mentored 3 junior engineers and led frontend architecture reviews at Vercel.'),
  -- c003: Priya Sharma – Full-Stack Engineer at Notion
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', '5+ years of professional frontend development experience', true, 'Has 6 years of full-stack experience with significant frontend focus at Notion and Figma.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Primary stack at Notion. Extensive React and TypeScript experience.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Experience building design systems or component libraries', false, 'No direct design system or component library ownership mentioned.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Strong understanding of web performance and accessibility', true, 'Optimized Notion editor performance, reducing load times by 40%.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'Experience mentoring engineers or leading technical initiatives', false, 'No explicit mentoring or tech lead experience in profile.'),
  -- c004: Marcus Johnson – Staff Engineer at Linear
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', '5+ years of professional frontend development experience', true, 'Over 9 years of engineering experience, primarily frontend at Linear and Shopify.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Core stack at Linear. Known for TypeScript expertise and CSS architecture.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Experience building design systems or component libraries', true, 'Developed Linear''s design system and Shopify''s Polaris component contributions.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Strong understanding of web performance and accessibility', true, 'Architected Linear''s real-time sync engine with sub-50ms render targets.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'Experience mentoring engineers or leading technical initiatives', true, 'Staff-level engineer leading technical direction for Linear''s frontend platform.'),
  -- c005: Aisha Patel – Software Engineer at Figma
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', '5+ years of professional frontend development experience', false, 'Has 3 years of professional experience at Figma. Below the 5-year threshold.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Strong React and TypeScript skills demonstrated at Figma. Uses Tailwind CSS.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Experience building design systems or component libraries', false, 'Contributed to Figma''s internal tools but did not own a component library.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Strong understanding of web performance and accessibility', true, 'Implemented performance monitoring for Figma''s canvas rendering pipeline.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000005', 'Experience mentoring engineers or leading technical initiatives', false, 'Still early career; no mentoring experience documented.'),
  -- c009: Sofia Martinez – UX Engineer at Google
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', '5+ years of professional frontend development experience', true, 'Has 5 years of UX engineering experience at Google and Meta.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 'Deep expertise in React, TypeScript, and modern CSS', false, 'Primarily uses Angular at Google. React experience is limited to side projects.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 'Experience building design systems or component libraries', true, 'Contributed to Google''s Material Design component library.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 'Strong understanding of web performance and accessibility', true, 'Strong accessibility focus at Google; led WCAG compliance audits.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000009', 'Experience mentoring engineers or leading technical initiatives', false, 'IC contributor; no documented mentoring or leadership scope.'),
  -- c026: Jane Warren – Senior Frontend Engineer at Vercel
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000026', '5+ years of professional frontend development experience', true, 'Has 6+ years across Vercel, Stripe, and Airbnb building frontend experiences.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000026', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Core stack at Vercel and Stripe. Led Tailwind CSS migration at Stripe.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000026', 'Experience building design systems or component libraries', true, 'Contributed to the Vercel design system used across all product surfaces.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000026', 'Strong understanding of web performance and accessibility', true, 'Built deployment analytics UI with performance-first architecture at Vercel.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000026', 'Experience mentoring engineers or leading technical initiatives', false, 'Senior IC role; no explicit mentoring experience documented.'),
  -- c027: Marco Alvarez – Staff Frontend Engineer at Shopify
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000027', '5+ years of professional frontend development experience', true, 'Over 7 years across Shopify, Square, and Atlassian with deep frontend focus.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000027', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Primary stack across all roles. Architected Shopify admin with React and TypeScript.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000027', 'Experience building design systems or component libraries', true, 'Built the Square Dashboard component library used by 20+ engineering teams.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000027', 'Strong understanding of web performance and accessibility', true, 'Reduced bundle size by 45% at Square. Led performance initiatives across the platform.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000027', 'Experience mentoring engineers or leading technical initiatives', true, 'Mentors 4 frontend engineers at Shopify. Led micro-frontend platform architecture.'),

  -- ── Account Executive (b002) ──
  -- c010: James O''Brien – Enterprise AE at Datadog
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', '3+ years of B2B SaaS sales experience selling to technical buyers', true, 'Has 6 years of enterprise sales at Datadog and New Relic, selling to engineering leaders.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Proven track record of meeting or exceeding quota', true, 'Consistently at 120%+ quota attainment over the past 3 years at Datadog.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Experience with consultative selling and complex deal cycles', true, 'Manages 6-9 month enterprise deal cycles with multi-stakeholder procurement.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Familiarity with developer tools or infrastructure products', true, 'Deep domain expertise from selling observability and APM products.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000010', 'Self-starter comfortable in an early-stage environment', false, 'Has only worked at large, established companies (500+ employees).'),
  -- c011: Rachel Kim – Account Executive at HashiCorp
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000011', '3+ years of B2B SaaS sales experience selling to technical buyers', true, 'Has 4 years selling infrastructure software to DevOps and platform teams.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000011', 'Proven track record of meeting or exceeding quota', true, 'President''s Club winner at HashiCorp for two consecutive years.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000011', 'Experience with consultative selling and complex deal cycles', true, 'Runs consultative sales motions with proof-of-value engagements.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000011', 'Familiarity with developer tools or infrastructure products', true, 'Sells Terraform and Vault directly to engineering organizations.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000011', 'Self-starter comfortable in an early-stage environment', true, 'Joined HashiCorp pre-IPO and helped build the mid-market playbook.'),
  -- c012: David Park – Senior AE at Twilio
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000012', '3+ years of B2B SaaS sales experience selling to technical buyers', true, 'Has 5 years of sales experience at Twilio and Segment selling API products.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000012', 'Proven track record of meeting or exceeding quota', true, 'Exceeded quota by 15-30% in each of the past 4 quarters.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000012', 'Experience with consultative selling and complex deal cycles', true, 'Manages complex, multi-product deals across Twilio''s communications suite.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000012', 'Familiarity with developer tools or infrastructure products', true, 'Sells developer APIs; regularly demos to engineering teams.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000012', 'Self-starter comfortable in an early-stage environment', false, 'Career has been at established, publicly-traded companies.'),
  -- c013: Emily Tanaka – SDR Manager at Confluent
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', '3+ years of B2B SaaS sales experience selling to technical buyers', false, 'Has SDR management experience but limited full-cycle closing experience.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', 'Proven track record of meeting or exceeding quota', true, 'Team consistently exceeded pipeline generation targets under her leadership.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', 'Experience with consultative selling and complex deal cycles', false, 'Focused on top-of-funnel outbound rather than deal management.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', 'Familiarity with developer tools or infrastructure products', true, 'Managed SDR team selling Kafka-based data streaming to engineering orgs.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', 'Self-starter comfortable in an early-stage environment', true, 'Built the SDR function at Confluent from scratch when team was under 50.'),

  -- ── Senior Product Designer (b003) ──
  -- c015: Mia Rodriguez – Lead Product Designer at Canva
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000015', '5+ years of product design experience with end-to-end portfolio', true, 'Over 7 years of product design experience at Canva, Spotify, and freelance.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000015', 'Deep proficiency in Figma including prototyping and components', true, 'Expert Figma user; built Canva''s internal design system with variables and auto-layout.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000015', 'Experience designing for developer tools or B2B SaaS platforms', false, 'Experience is primarily in consumer design tools, not developer-facing products.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000015', 'Strong systems thinking for design system work', true, 'Led design system initiatives at Canva; created a component library used by 40+ designers.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000015', 'Experience with user research methods and data-informed design', true, 'Runs regular usability studies and uses analytics to validate design decisions.'),
  -- c016: Noah Williams – Senior Designer at Figma
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000016', '5+ years of product design experience with end-to-end portfolio', true, 'Has 6 years of product design experience with end-to-end case studies at Figma and InVision.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000016', 'Deep proficiency in Figma including prototyping and components', true, 'Designs Figma''s own product — deeply proficient with advanced Figma features.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000016', 'Experience designing for developer tools or B2B SaaS platforms', true, 'Designed developer-facing features at Figma including Dev Mode and API documentation.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000016', 'Strong systems thinking for design system work', true, 'Built a cross-platform design system at Figma used by 50+ designers.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000016', 'Experience with user research methods and data-informed design', true, 'Led research sprints with developer users and iterated designs based on session recordings.'),
  -- c018: Alexander Brown – UX Designer at Shopify
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000018', '5+ years of product design experience with end-to-end portfolio', false, 'Has 3 years of professional UX design experience. Below the 5-year bar.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000018', 'Deep proficiency in Figma including prototyping and components', true, 'Strong Figma skills demonstrated through component creation at Shopify.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000018', 'Experience designing for developer tools or B2B SaaS platforms', true, 'Designed Shopify''s developer portal and API documentation experience.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000018', 'Strong systems thinking for design system work', false, 'Used Polaris but did not lead or significantly contribute to design system work.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000018', 'Experience with user research methods and data-informed design', true, 'Conducted user interviews and card sorting for the merchant admin redesign.'),

  -- ── Machine Learning Engineer (b004) ──
  -- c002: Ethan Brooks – ML Engineer at OpenAI
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', '3+ years of ML engineering or applied ML research experience', true, 'Has 5 years of ML experience at OpenAI and DeepMind.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Hands-on experience with LLMs including fine-tuning or inference optimization', true, 'Works directly on LLM fine-tuning and RLHF at OpenAI.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Expert in PyTorch and distributed training at scale. Uses JAX and PyTorch daily.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Experience building production ML systems with monitoring', true, 'Built production inference pipelines with latency monitoring and auto-scaling.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Strong fundamentals in statistics and optimization', true, 'PhD coursework in statistical learning theory; published optimization research.'),
  -- c006: Daniel Kim – Data Scientist at Netflix
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', '3+ years of ML engineering or applied ML research experience', true, 'Has 4 years of data science and ML experience at Netflix and Uber.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Hands-on experience with LLMs including fine-tuning or inference optimization', false, 'Focused on recommendation systems and A/B testing, not LLM work.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Strong Python skills; uses PyTorch for model development.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Experience building production ML systems with monitoring', true, 'Built production recommendation pipelines serving millions of users.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000006', 'Strong fundamentals in statistics and optimization', true, 'MS in Statistics; strong experimental design and causal inference skills.'),
  -- c007: Olivia Wang – Research Engineer at Anthropic
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', '3+ years of ML engineering or applied ML research experience', true, 'Has 4 years of ML research and engineering at Anthropic and Google Brain.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', 'Hands-on experience with LLMs including fine-tuning or inference optimization', true, 'Works on constitutional AI and RLHF for large language models at Anthropic.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Expert in JAX and PyTorch; trains models across large GPU clusters.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', 'Experience building production ML systems with monitoring', false, 'Research-focused role; limited production deployment experience.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000007', 'Strong fundamentals in statistics and optimization', true, 'Published at NeurIPS and ICML on optimization methods for LLM training.'),
  -- c008: William Taylor – Backend Engineer at Databricks
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', '3+ years of ML engineering or applied ML research experience', false, 'Backend engineering focus. ML experience limited to platform tooling, not model development.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', 'Hands-on experience with LLMs including fine-tuning or inference optimization', false, 'No direct LLM training or fine-tuning experience.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Strong Python skills and familiarity with Spark ML and distributed systems.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', 'Experience building production ML systems with monitoring', true, 'Built MLflow-based model serving infrastructure at Databricks.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000008', 'Strong fundamentals in statistics and optimization', false, 'Engineering background; statistics knowledge is practical, not formal.'),

  -- ── Content Marketing Lead (b005) ──
  -- c020: Hannah Foster – Content Strategist at HubSpot
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000020', '4+ years of content marketing experience in developer tools or B2B SaaS', true, 'Has 6 years of content strategy at HubSpot and Mailchimp in B2B SaaS.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000020', 'Exceptional writing skills with published technical content portfolio', true, 'Published over 100 blog posts and 12 long-form guides at HubSpot.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000020', 'Ability to distill complex technical concepts into clear narratives', true, 'Known for making API and integration topics accessible to non-technical readers.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000020', 'Familiarity with SEO, content analytics, and distribution strategies', true, 'Led SEO strategy that grew organic traffic 3x over 18 months.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000020', 'Experience marketing to software developers', false, 'Primarily marketed to marketers and sales professionals, not developers.'),
  -- c021: Tyler Reed – Marketing Manager at Cloudflare
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000021', '4+ years of content marketing experience in developer tools or B2B SaaS', true, 'Has 5 years of marketing experience at Cloudflare and Fastly, developer-focused companies.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000021', 'Exceptional writing skills with published technical content portfolio', true, 'Wrote technical blog posts about Workers, R2, and edge computing.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000021', 'Ability to distill complex technical concepts into clear narratives', true, 'Effectively communicated complex CDN and security concepts to broad audiences.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000021', 'Familiarity with SEO, content analytics, and distribution strategies', true, 'Managed Cloudflare''s blog SEO and content distribution across social and Hacker News.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000021', 'Experience marketing to software developers', true, 'Core audience is developers; regularly writes for Cloudflare''s developer blog.'),
  -- c022: Jessica Chen – Content Lead at Notion
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000022', '4+ years of content marketing experience in developer tools or B2B SaaS', true, 'Has 5 years of content marketing at Notion and Airtable.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000022', 'Exceptional writing skills with published technical content portfolio', true, 'Led Notion''s content program; multiple pieces featured in major publications.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000022', 'Ability to distill complex technical concepts into clear narratives', true, 'Turned complex product features into compelling customer stories and tutorials.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000022', 'Familiarity with SEO, content analytics, and distribution strategies', true, 'Built Notion''s SEO-driven content strategy from scratch.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000022', 'Experience marketing to software developers', false, 'Notion audience is broad (project managers, designers); not specifically developers.'),
  -- c023: Ryan Mitchell – Copywriter at Atlassian
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000023', '4+ years of content marketing experience in developer tools or B2B SaaS', true, 'Has 4 years of content work at Atlassian, a B2B SaaS company.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000023', 'Exceptional writing skills with published technical content portfolio', false, 'Primarily writes UX copy and short-form content, not long-form technical pieces.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000023', 'Ability to distill complex technical concepts into clear narratives', true, 'Simplifies Jira and Confluence workflows into user-friendly documentation.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000023', 'Familiarity with SEO, content analytics, and distribution strategies', false, 'No SEO or analytics responsibilities in current role.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000023', 'Experience marketing to software developers', true, 'Atlassian''s core audience includes developers using Jira and Bitbucket.'),
  -- c025: Isaac Lee – Technical Writer at Vercel
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000025', '4+ years of content marketing experience in developer tools or B2B SaaS', false, 'Has 2 years of technical writing experience. Below the 4-year threshold.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000025', 'Exceptional writing skills with published technical content portfolio', true, 'Authors Next.js documentation used by 1M+ developers monthly.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000025', 'Ability to distill complex technical concepts into clear narratives', true, 'Excels at making framework concepts accessible through migration guides and tutorials.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000025', 'Familiarity with SEO, content analytics, and distribution strategies', false, 'Technical documentation focus; no marketing distribution or SEO experience.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000025', 'Experience marketing to software developers', true, 'Writes exclusively for a developer audience at Vercel.'),

  -- ── Extra application-review criteria ──
  -- Senior Frontend Engineer (b001) — c010, c017, c020
  -- c010: Marcus Johnson → top match (4/5)
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', '5+ years of professional frontend development experience', true, 'Previously built internal dashboards at Salesforce using React.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Built custom CRM dashboards with React and TypeScript at Salesforce.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Experience building design systems or component libraries', true, 'Created shared component library for the sales ops internal tools team.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Strong understanding of web performance and accessibility', true, 'Led performance audit of Salesforce internal tooling, cutting load times by 30%.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 'Experience mentoring engineers or leading technical initiatives', false, 'Mentored sales reps but not engineers specifically.'),
  -- c017: Olivia Hart → worth review (3/5)
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000017', '5+ years of professional frontend development experience', false, 'Has 4 years of UX design, not frontend engineering specifically.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000017', 'Deep expertise in React, TypeScript, and modern CSS', false, 'Design-focused; CSS skills present but no React/TypeScript depth.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000017', 'Experience building design systems or component libraries', true, 'Built component specifications and design token systems at Square.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000017', 'Strong understanding of web performance and accessibility', true, 'Strong accessibility focus in UX work at Square.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000017', 'Experience mentoring engineers or leading technical initiatives', true, 'Led cross-functional design sprints involving engineers.'),
  -- c020: Sophie Chen → top match (4/5)
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000020', '5+ years of professional frontend development experience', true, 'Built marketing landing pages and A/B test frameworks in React at HubSpot.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000020', 'Deep expertise in React, TypeScript, and modern CSS', true, 'Hands-on React and TypeScript for growth engineering at HubSpot.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000020', 'Experience building design systems or component libraries', true, 'Maintained HubSpot''s marketing component library.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000020', 'Strong understanding of web performance and accessibility', true, 'Led Core Web Vitals optimization initiative across HubSpot marketing pages.'),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000020', 'Experience mentoring engineers or leading technical initiatives', false, 'Individual contributor; no mentoring experience.'),

  -- Account Executive (b002) — c007, c015, c017
  -- c007: Ava Nguyen → top match (4/5)
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', '3+ years of B2B SaaS sales experience selling to technical buyers', true, 'Sold data analytics solutions to engineering leaders at Lyft partner companies.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', 'Proven track record of meeting or exceeding quota', true, 'Exceeded pipeline targets by 140% in her analytics consulting role.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', 'Experience with consultative selling and complex deal cycles', true, 'Ran consultative workshops with enterprise clients on data strategy.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', 'Familiarity with developer tools or infrastructure products', true, 'Works with data tools daily at Lyft; deep understanding of technical buyer needs.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000007', 'Self-starter comfortable in an early-stage environment', false, 'Has worked at established companies.'),
  -- c015: Priya Sharma → worth review (3/5)
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015', '3+ years of B2B SaaS sales experience selling to technical buyers', false, 'Product designer; no sales background.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015', 'Proven track record of meeting or exceeding quota', false, 'No sales quota experience.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015', 'Experience with consultative selling and complex deal cycles', true, 'Ran design workshops that influenced $2M+ enterprise deals at Figma.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015', 'Familiarity with developer tools or infrastructure products', true, 'Deep expertise designing for Figma, a developer-adjacent tool.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000015', 'Self-starter comfortable in an early-stage environment', true, 'Joined Figma at an early growth stage.'),
  -- c017: Olivia Hart → top match (4/5)
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000017', '3+ years of B2B SaaS sales experience selling to technical buyers', true, 'Led client-facing workshops selling design tool subscriptions at Square.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000017', 'Proven track record of meeting or exceeding quota', true, 'Achieved 120% of engagement targets in her design consulting practice.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000017', 'Experience with consultative selling and complex deal cycles', true, 'Ran multi-stakeholder design reviews for enterprise accounts.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000017', 'Familiarity with developer tools or infrastructure products', true, 'Uses developer-adjacent design tools daily.'),
  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000017', 'Self-starter comfortable in an early-stage environment', false, 'Has only worked at established companies.'),

  -- Senior Product Designer (b003) — c006, c011, c021
  -- c006: Tyler Washington → top match (4/5)
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', '5+ years of product design experience with end-to-end portfolio', true, 'Built end-to-end data visualization dashboards with strong UX at Snowflake.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', 'Deep proficiency in Figma including prototyping and components', true, 'Created Figma prototypes for the Snowflake query builder redesign.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', 'Experience designing for developer tools or B2B SaaS platforms', true, 'Designed developer-facing interfaces for Snowflake and Kafka tooling.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', 'Strong systems thinking for design system work', true, 'Built systematic component patterns for data pipeline visualization.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000006', 'Experience with user research methods and data-informed design', false, 'Uses analytics but hasn''t conducted formal user research studies.'),
  -- c011: Rachel Foster → top match (4/5)
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', '5+ years of product design experience with end-to-end portfolio', true, 'Designed customer-facing sales portal with complete UX flow at Zendesk.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 'Deep proficiency in Figma including prototyping and components', true, 'Built interactive Figma prototypes for Zendesk''s deal management tool.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 'Experience designing for developer tools or B2B SaaS platforms', true, 'Designed B2B SaaS interfaces at Zendesk used by support teams.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 'Strong systems thinking for design system work', false, 'Used design systems but didn''t build or maintain one.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 'Experience with user research methods and data-informed design', true, 'Conducts customer discovery calls and analyzes buyer personas.'),
  -- c021: Ethan Brooks → worth review (3/5)
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000021', '5+ years of product design experience with end-to-end portfolio', false, 'Content marketing background; no design portfolio.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000021', 'Deep proficiency in Figma including prototyping and components', false, 'Limited Figma experience for content graphics only.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000021', 'Experience designing for developer tools or B2B SaaS platforms', true, 'Created visual content for Contentful, a developer-focused CMS.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000021', 'Strong systems thinking for design system work', true, 'Built systematic content templates and visual guidelines.'),
  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000021', 'Experience with user research methods and data-informed design', true, 'Runs content A/B tests and user surveys for content strategy.'),

  -- Machine Learning Engineer (b004) — c003, c013, c017
  -- c003: Liam O''Brien → top match (4/5)
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', '3+ years of ML engineering or applied ML research experience', true, 'Built ML-powered search and recommendation features at Airbnb.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Hands-on experience with LLMs including fine-tuning or inference optimization', true, 'Fine-tuned GPT models for Airbnb''s smart search suggestions.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Strong Python skills from ML feature work; uses PyTorch for model prototyping.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Experience building production ML systems with monitoring', true, 'Deployed ML models to production with monitoring dashboards at Airbnb.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000003', 'Strong fundamentals in statistics and optimization', false, 'HCI research includes some statistical methods, but not optimization depth.'),
  -- c013: Jessica Park → top match (4/5)
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000013', '3+ years of ML engineering or applied ML research experience', true, 'Built ML-driven lead scoring models at Gong using conversation data.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000013', 'Hands-on experience with LLMs including fine-tuning or inference optimization', true, 'Fine-tuned LLMs for sales call summarization and sentiment analysis at Gong.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000013', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Proficient in Python and PyTorch for model development at Gong.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000013', 'Experience building production ML systems with monitoring', true, 'Deployed NLP models serving 1000+ enterprise customers with monitoring.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000013', 'Strong fundamentals in statistics and optimization', false, 'Applied statistics knowledge; lacks formal optimization background.'),
  -- c017: Olivia Hart → top match (4/5)
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000017', '3+ years of ML engineering or applied ML research experience', true, 'Applied ML in user research — built predictive models for usability outcomes.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000017', 'Hands-on experience with LLMs including fine-tuning or inference optimization', true, 'Used LLMs to auto-generate research summaries and tag usability issues.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000017', 'Proficiency in Python, PyTorch, and distributed training frameworks', true, 'Built Python-based ML pipelines for UX analytics at Square.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000017', 'Experience building production ML systems with monitoring', false, 'Research prototypes only; no production ML deployment.'),
  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000017', 'Strong fundamentals in statistics and optimization', true, 'User research background includes statistical analysis of usability data.'),

  -- Content Marketing Lead (b005) — c003, c006, c015
  -- c003: Liam O''Brien → top match (4/5)
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', '4+ years of content marketing experience in developer tools or B2B SaaS', true, 'Wrote technical blog posts about frontend architecture at Airbnb engineering blog.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Exceptional writing skills with published technical content portfolio', true, 'Published articles on design systems and React patterns on Medium and dev.to.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Ability to distill complex technical concepts into clear narratives', true, 'Known for clear technical writing; regularly speaks at meetups.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Familiarity with SEO, content analytics, and distribution strategies', true, 'Optimized Airbnb blog posts for SEO; grew organic traffic to engineering blog.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', 'Experience marketing to software developers', false, 'Writes for developers but from an engineering, not marketing, perspective.'),
  -- c006: Tyler Washington → top match (4/5)
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', '4+ years of content marketing experience in developer tools or B2B SaaS', true, 'Created developer documentation and tutorials for Snowflake data tools.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'Exceptional writing skills with published technical content portfolio', true, 'Published deep-dive technical guides on data engineering best practices.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'Ability to distill complex technical concepts into clear narratives', true, 'Known for making complex data pipeline concepts accessible.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'Familiarity with SEO, content analytics, and distribution strategies', false, 'Technical documentation focus; no SEO or distribution experience.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006', 'Experience marketing to software developers', true, 'Writes exclusively for a developer and data engineer audience.'),
  -- c015: Priya Sharma → worth review (3/5)
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000015', '4+ years of content marketing experience in developer tools or B2B SaaS', false, 'Product designer; not a content marketer.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000015', 'Exceptional writing skills with published technical content portfolio', true, 'Published case studies and design articles on Medium and Figma blog.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000015', 'Ability to distill complex technical concepts into clear narratives', true, 'Excels at presenting design rationale to engineering audiences.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000015', 'Familiarity with SEO, content analytics, and distribution strategies', false, 'No SEO or content distribution experience.'),
  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000015', 'Experience marketing to software developers', true, 'Designed and documented developer-facing tools at Figma.');

-- ============================================================
-- Candidate activities (demo timeline for Jane Warren)
-- ============================================================

INSERT INTO candidate_activities (candidate_id, application_id, activity_type, action, detail, metadata, created_at)
SELECT
  'c0000000-0000-0000-0000-000000000026',
  a.id,
  v.activity_type,
  v.action,
  v.detail,
  v.metadata::jsonb,
  v.created_at::timestamptz
FROM applications a
CROSS JOIN (VALUES
  ('application_events', 'Application received', 'Applied via referral for Senior Frontend Engineer', '{}', '2026-02-14T09:00:00Z'),
  ('application_events', 'Application reviewed', 'Recommended for phone screen by Applicant review agent', '{}', '2026-02-15T14:30:00Z'),
  ('data_changes', 'Profile enriched', 'Cross-referenced LinkedIn, GitHub, and internal DB', '{}', '2026-02-16T11:00:00Z'),
  ('communication', 'Request availability sent', 'To: Jane Warren', '{"reqTitle":"(1000) Senior Frontend Engineer"}', '2026-04-01T13:05:00Z'),
  ('interviews_and_feedbacks', 'Phone screen scheduled', 'Thursday, Apr 10 at 2:00 PM with Leslie Alexander', '{}', '2026-04-02T10:00:00Z'),
  ('application_moved', 'Moved to Phone screen stage', 'Advanced from Application review by Anne Montgomery', '{}', '2026-04-02T10:05:00Z'),
  ('interviews_and_feedbacks', 'Interview scheduled', 'Confirmation sent to Jane Warren', '{"reqTitle":"(1000) Senior Frontend Engineer"}', '2026-04-20T10:00:00Z')
) AS v(activity_type, action, detail, metadata, created_at)
WHERE a.candidate_id = 'c0000000-0000-0000-0000-000000000026'
  AND a.req_id = 'b0000000-0000-0000-0000-000000000001';

-- ============================================================
-- Application interviews (scheduled state for demo)
-- ============================================================

-- Marcus Johnson – Hiring manager screen scheduled
INSERT INTO application_interviews (
  application_id, stage_id, source_req_interview_id,
  title, interview_type, duration_minutes, interviewer_name,
  scheduled_at, status, order_position
)
SELECT
  a.id,
  'e0000000-0000-0000-0002-000000000003',
  'f0000000-0000-0002-0000-000000000002',
  'Hiring manager screen',
  'standard',
  45,
  'Diana Kim',
  '2026-05-12 17:00:00+00',
  'scheduled',
  0
FROM applications a
WHERE a.candidate_id = 'c0000000-0000-0000-0000-000000000010'
  AND a.req_id = 'b0000000-0000-0000-0000-000000000002';
