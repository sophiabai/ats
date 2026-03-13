-- Seed data for local development
-- Automatically run by `supabase db reset`

-- ============================================================
-- Candidates (25 candidates with stable UUIDs)
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
  ('c0000000-0000-0000-0000-000000000025', 'Isaac', 'Lee', 'isaac.l@email.com', '206-555-0125', 'Seattle', 'Technical content writer for developer audiences', 3, 'Vercel', 'Technical Writer', ARRAY['Technical Writing','Developer Marketing','MDX','SEO'], ARRAY['mid-level','linkedin']);

-- ============================================================
-- Requisitions (5 reqs with stable UUIDs)
-- ============================================================
INSERT INTO requisitions (id, title, department, location, employment_type, recruiter_name, hiring_manager_name, status, description, requirements, salary_min, salary_max, headcount, location_pay_ranges) VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
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

-- ============================================================
-- Req stages (pipeline stages for each requisition)
-- ============================================================
-- Senior Frontend Engineer
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0001-000000000001', 'b0000000-0000-0000-0000-000000000001', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0001-000000000002', 'b0000000-0000-0000-0000-000000000001', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0001-000000000003', 'b0000000-0000-0000-0000-000000000001', 'screen', 'Technical screen', 1),
  ('e0000000-0000-0000-0001-000000000004', 'b0000000-0000-0000-0000-000000000001', 'final_interview', 'Onsite interview', 0),
  ('e0000000-0000-0000-0001-000000000005', 'b0000000-0000-0000-0000-000000000001', 'offer', 'Offer', 0);
-- Account Executive
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0002-000000000001', 'b0000000-0000-0000-0000-000000000002', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0002-000000000002', 'b0000000-0000-0000-0000-000000000002', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0002-000000000003', 'b0000000-0000-0000-0000-000000000002', 'screen', 'Hiring manager screen', 1),
  ('e0000000-0000-0000-0002-000000000004', 'b0000000-0000-0000-0000-000000000002', 'final_interview', 'Panel interview', 0),
  ('e0000000-0000-0000-0002-000000000005', 'b0000000-0000-0000-0000-000000000002', 'offer', 'Offer', 0);
-- Senior Product Designer
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0003-000000000001', 'b0000000-0000-0000-0000-000000000003', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0003-000000000002', 'b0000000-0000-0000-0000-000000000003', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0003-000000000003', 'b0000000-0000-0000-0000-000000000003', 'screen', 'Portfolio review', 1),
  ('e0000000-0000-0000-0003-000000000004', 'b0000000-0000-0000-0000-000000000003', 'final_interview', 'Design challenge + onsite', 0),
  ('e0000000-0000-0000-0003-000000000005', 'b0000000-0000-0000-0000-000000000003', 'offer', 'Offer', 0);
-- Data Engineer
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0004-000000000001', 'b0000000-0000-0000-0000-000000000004', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0004-000000000002', 'b0000000-0000-0000-0000-000000000004', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0004-000000000003', 'b0000000-0000-0000-0000-000000000004', 'screen', 'Technical screen', 1),
  ('e0000000-0000-0000-0004-000000000004', 'b0000000-0000-0000-0000-000000000004', 'final_interview', 'System design interview', 0),
  ('e0000000-0000-0000-0004-000000000005', 'b0000000-0000-0000-0000-000000000004', 'offer', 'Offer', 0);
-- Content Marketing Lead
INSERT INTO req_stages (id, req_id, milestone, name, sort_order) VALUES
  ('e0000000-0000-0000-0005-000000000001', 'b0000000-0000-0000-0000-000000000005', 'application', 'Application review', 0),
  ('e0000000-0000-0000-0005-000000000002', 'b0000000-0000-0000-0000-000000000005', 'screen', 'Recruiter screen', 0),
  ('e0000000-0000-0000-0005-000000000003', 'b0000000-0000-0000-0000-000000000005', 'screen', 'Writing exercise', 1),
  ('e0000000-0000-0000-0005-000000000004', 'b0000000-0000-0000-0000-000000000005', 'final_interview', 'Final interview', 0),
  ('e0000000-0000-0000-0005-000000000005', 'b0000000-0000-0000-0000-000000000005', 'offer', 'Offer', 0);

-- ============================================================
-- Applications (each req gets 4-6 candidates at various stages)
-- ============================================================
-- Senior Frontend Engineer (5 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-02-10', 'referral',     'final_interview', 'e0000000-0000-0000-0001-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '2026-02-12', 'referral',     'screen',          'e0000000-0000-0000-0001-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', '2026-02-15', 'linkedin',     'offer',           'e0000000-0000-0000-0001-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', '2026-02-18', 'careers_page', 'screen',          'e0000000-0000-0000-0001-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, rejected_reason) VALUES
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', '2026-02-20', 'careers_page', 'application',     'e0000000-0000-0000-0001-000000000001', 'rejected', 'Not enough experience with design systems');

-- Account Executive (5 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000002', '2026-02-05', 'linkedin',     'final_interview', 'e0000000-0000-0000-0002-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000002', '2026-02-08', 'linkedin',     'screen',          'e0000000-0000-0000-0002-000000000003', 'active'),
  ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000002', '2026-02-10', 'agency',       'offer',           'e0000000-0000-0000-0002-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000002', '2026-02-14', 'referral',     'screen',          'e0000000-0000-0000-0002-000000000002', 'active');
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status, withdrawn_reason) VALUES
  ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000002', '2026-02-20', 'linkedin',     'application',     'e0000000-0000-0000-0002-000000000001', 'withdrawn', 'Accepted another offer');

-- Senior Product Designer (5 candidates)
INSERT INTO applications (candidate_id, req_id, applied_date, source, current_milestone, current_stage_id, status) VALUES
  ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000003', '2026-02-01', 'referral',     'final_interview', 'e0000000-0000-0000-0003-000000000004', 'active'),
  ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000003', '2026-02-03', 'linkedin',     'offer',           'e0000000-0000-0000-0003-000000000005', 'active'),
  ('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000003', '2026-02-07', 'careers_page', 'screen',          'e0000000-0000-0000-0003-000000000003', 'active'),
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
