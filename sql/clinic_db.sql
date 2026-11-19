-- =====================================================================
--  clinic_db  ·  sample medical-records data for SQL teaching demos
--  PostgreSQL 12+ · 5 tables · primary and foreign keys included
--
--  ALL DATA IS FICTIONAL. Names, addresses, phone numbers (555-01xx),
--  insurance plans and clinical details were invented for teaching
--  and do not describe real people.
--
--  HOW TO LOAD IN pgADMIN
--    1. In the browser tree, click the database you want the tables in.
--    2. Tools > Query Tool  (or right-click the database > Query Tool).
--    3. Click the "Open File" folder icon and choose this file
--       (or paste its contents into the editor).
--    4. Press F5 (or click the Execute ▶ button).
--    5. Right-click Schemas > public > Tables > Refresh to see the tables.
--
--  Safe to run again: it drops and recreates these five tables only.
--  The whole script runs in one transaction, so it either loads
--  completely or changes nothing.
--
--  Relationships
--    patients 1 ──< diagnoses        (diagnoses.patient_id)
--    patients 1 ──< medications      (medications.patient_id)
--    patients 1 ──< lab_results      (lab_results.patient_id)
--    patients 1 ──< treatment_plans  (treatment_plans.patient_id)
--    diagnoses 1 ──< treatment_plans (treatment_plans.diagnosis_id)
-- =====================================================================

BEGIN;

DROP TABLE IF EXISTS treatment_plans, lab_results, medications, diagnoses, patients CASCADE;

-- One row per person registered at the clinic
CREATE TABLE patients (
    patient_id     INT PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    birthdate      DATE NOT NULL,
    address        VARCHAR(200),
    phone_number   VARCHAR(20),
    insurance      VARCHAR(60)          -- NULL means uninsured / self-pay
);

-- Conditions a patient has been diagnosed with
CREATE TABLE diagnoses (
    diagnosis_id       INT PRIMARY KEY,
    patient_id         INT NOT NULL,
    medical_condition  VARCHAR(100) NOT NULL,
    diagnosis_date     DATE NOT NULL,
    CONSTRAINT diagnoses_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
);

-- Current prescriptions
CREATE TABLE medications (
    medication_id  INT PRIMARY KEY,
    patient_id     INT NOT NULL,
    drug_name      VARCHAR(100) NOT NULL,
    dosage         VARCHAR(50) NOT NULL,
    instructions   VARCHAR(250),
    CONSTRAINT medications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
);

-- Laboratory test results (the unit is part of the test name)
CREATE TABLE lab_results (
    result_id      INT PRIMARY KEY,
    patient_id     INT NOT NULL,
    test_name      VARCHAR(60) NOT NULL,
    result_value   NUMERIC(8,2) NOT NULL,
    result_date    DATE NOT NULL,
    CONSTRAINT lab_results_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients (patient_id)
);

-- Treatment plans, each tied to one patient and the diagnosis it treats
CREATE TABLE treatment_plans (
    treatment_plan_id      INT PRIMARY KEY,
    patient_id             INT NOT NULL,
    diagnosis_id           INT NOT NULL,
    recommended_treatment  VARCHAR(250) NOT NULL,
    start_date             DATE NOT NULL,
    CONSTRAINT treatment_plans_patient_id_fkey   FOREIGN KEY (patient_id)   REFERENCES patients (patient_id),
    CONSTRAINT treatment_plans_diagnosis_id_fkey FOREIGN KEY (diagnosis_id) REFERENCES diagnoses (diagnosis_id)
);

INSERT INTO patients (patient_id, full_name, birthdate, address, phone_number, insurance) VALUES
    (1, 'Maria Lopez', '1958-03-14', '412 Alder St, Springfield, OR 97477', '(541) 555-0101', 'Medicare'),
    (2, 'James Carter', '1971-07-22', '88 Birch Ave, Riverton, WA 98002', '(253) 555-0102', 'Evergreen Health Plan'),
    (3, 'Aisha Rahman', '1989-11-05', '1503 Cedar Ln, Lakeview, OR 97630', '(541) 555-0103', 'Summit Mutual'),
    (4, 'Daniel Kim', '1995-02-18', '27 Dogwood Ct, Riverton, WA 98002', '(253) 555-0104', 'Evergreen Health Plan'),
    (5, 'Grace Thompson', '1946-09-30', '9 Elm Terrace, Springfield, OR 97477', '(541) 555-0105', 'Medicare'),
    (6, 'Luis Fernandez', '1983-05-09', '640 Fir Rd, Harbor City, WA 98101', '(206) 555-0106', 'Medicaid'),
    (7, 'Hannah Becker', '2001-12-01', '3315 Grove St, Lakeview, OR 97630', '(541) 555-0107', 'Summit Mutual'),
    (8, 'Robert Nguyen', '1964-08-27', '71 Hawthorn Dr, Harbor City, WA 98101', '(206) 555-0108', 'Medicare'),
    (9, 'Priya Shah', '1977-04-12', '505 Ivy Way, Springfield, OR 97477', '(541) 555-0109', 'Evergreen Health Plan'),
    (10, 'Samuel Okafor', '1990-10-23', '1220 Juniper Pl, Riverton, WA 98002', '(253) 555-0110', 'Northgate Care'),
    (11, 'Emily Walsh', '1968-01-16', '48 Kestrel Rd, Harbor City, WA 98101', '(206) 555-0111', 'Northgate Care'),
    (12, 'Kenji Sato', '1952-06-08', '930 Laurel Blvd, Lakeview, OR 97630', '(541) 555-0112', 'Medicare'),
    (13, 'Olivia Martin', '2010-03-29', '16 Maple Row, Springfield, OR 97477', '(541) 555-0113', 'Medicaid'),
    (14, 'Marcus Bell', '1986-12-19', '702 Nettle St, Riverton, WA 98002', '(253) 555-0114', NULL),
    (15, 'Sofia Rossi', '1999-09-03', '2101 Oak Hollow, Harbor City, WA 98101', '(206) 555-0115', 'Summit Mutual');

INSERT INTO diagnoses (diagnosis_id, patient_id, medical_condition, diagnosis_date) VALUES
    (101, 1, 'Type 2 diabetes mellitus', '2019-04-10'),
    (102, 1, 'Hypertension', '2017-09-22'),
    (103, 2, 'Hyperlipidemia', '2021-02-03'),
    (104, 2, 'Hypertension', '2021-02-03'),
    (105, 3, 'Asthma', '2008-06-15'),
    (106, 3, 'Seasonal allergic rhinitis', '2015-04-02'),
    (107, 4, 'Migraine', '2020-11-19'),
    (108, 5, 'Atrial fibrillation', '2022-01-28'),
    (109, 5, 'Osteoarthritis of the knee', '2016-08-11'),
    (110, 5, 'Chronic kidney disease, stage 3', '2023-03-07'),
    (111, 6, 'Major depressive disorder', '2022-05-16'),
    (112, 6, 'Gastroesophageal reflux disease', '2023-09-01'),
    (113, 7, 'Iron deficiency anemia', '2024-02-20'),
    (114, 8, 'Chronic obstructive pulmonary disease', '2018-12-04'),
    (115, 8, 'Type 2 diabetes mellitus', '2020-07-30'),
    (116, 9, 'Hypothyroidism', '2014-10-09'),
    (117, 9, 'Vitamin D deficiency', '2024-01-12'),
    (118, 10, 'Asthma', '2012-03-25'),
    (119, 11, 'Hypertension', '2019-06-18'),
    (120, 11, 'Hyperlipidemia', '2022-10-05'),
    (121, 12, 'Atrial fibrillation', '2021-08-14'),
    (122, 12, 'Hypothyroidism', '2018-02-27'),
    (123, 13, 'Asthma', '2016-05-04'),
    (124, 14, 'Migraine', '2024-06-21');

INSERT INTO medications (medication_id, patient_id, drug_name, dosage, instructions) VALUES
    (201, 1, 'Metformin', '500 mg', 'Take by mouth twice daily with breakfast and dinner'),
    (202, 1, 'Lisinopril', '10 mg', 'Take by mouth once daily in the morning'),
    (203, 2, 'Atorvastatin', '20 mg', 'Take by mouth once daily at bedtime'),
    (204, 2, 'Amlodipine', '5 mg', 'Take by mouth once daily'),
    (205, 3, 'Albuterol inhaler', '90 mcg/puff', 'Inhale 2 puffs every 4 to 6 hours as needed for wheezing'),
    (206, 3, 'Fluticasone inhaler', '110 mcg/puff', 'Inhale 2 puffs twice daily; rinse mouth after use'),
    (207, 3, 'Cetirizine', '10 mg', 'Take by mouth once daily during allergy season'),
    (208, 4, 'Sumatriptan', '50 mg', 'Take 1 tablet at migraine onset; may repeat once after 2 hours'),
    (209, 5, 'Apixaban', '5 mg', 'Take by mouth twice daily, about 12 hours apart'),
    (210, 5, 'Acetaminophen', '500 mg', 'Take 1 to 2 tablets every 6 hours as needed; max 3,000 mg per day'),
    (211, 6, 'Sertraline', '50 mg', 'Take by mouth once daily in the morning'),
    (212, 6, 'Omeprazole', '20 mg', 'Take 30 minutes before breakfast'),
    (213, 7, 'Ferrous sulfate', '325 mg', 'Take once daily with orange juice; avoid taking with tea or milk'),
    (214, 8, 'Tiotropium inhaler', '18 mcg', 'Inhale contents of 1 capsule once daily'),
    (215, 8, 'Metformin', '1000 mg', 'Take by mouth twice daily with meals'),
    (216, 9, 'Levothyroxine', '75 mcg', 'Take on an empty stomach 30 to 60 minutes before breakfast'),
    (217, 9, 'Cholecalciferol (vitamin D3)', '2000 IU', 'Take by mouth once daily with food'),
    (218, 10, 'Albuterol inhaler', '90 mcg/puff', 'Inhale 2 puffs 15 minutes before exercise'),
    (219, 11, 'Lisinopril', '20 mg', 'Take by mouth once daily'),
    (220, 11, 'Rosuvastatin', '10 mg', 'Take by mouth once daily'),
    (221, 12, 'Apixaban', '2.5 mg', 'Take by mouth twice daily'),
    (222, 12, 'Levothyroxine', '50 mcg', 'Take on an empty stomach before breakfast'),
    (223, 13, 'Albuterol inhaler', '90 mcg/puff', 'Inhale 2 puffs every 4 hours as needed; use with spacer');

INSERT INTO lab_results (result_id, patient_id, test_name, result_value, result_date) VALUES
    (301, 1, 'HbA1c (%)', 8.10, '2024-01-15'),
    (302, 1, 'HbA1c (%)', 7.40, '2024-07-16'),
    (303, 1, 'Fasting glucose (mg/dL)', 148.00, '2024-07-16'),
    (304, 1, 'Creatinine (mg/dL)', 1.02, '2024-07-16'),
    (305, 2, 'LDL cholesterol (mg/dL)', 162.00, '2024-02-08'),
    (306, 2, 'LDL cholesterol (mg/dL)', 118.00, '2024-08-12'),
    (307, 2, 'Total cholesterol (mg/dL)', 236.00, '2024-02-08'),
    (308, 3, 'Eosinophils (%)', 6.20, '2024-04-03'),
    (309, 4, 'Hemoglobin (g/dL)', 14.60, '2024-05-21'),
    (310, 5, 'INR', 1.10, '2024-03-11'),
    (311, 5, 'eGFR (mL/min/1.73m2)', 52.00, '2024-03-11'),
    (312, 5, 'eGFR (mL/min/1.73m2)', 48.00, '2024-09-10'),
    (313, 5, 'Potassium (mmol/L)', 4.90, '2024-09-10'),
    (314, 6, 'TSH (mIU/L)', 2.10, '2024-06-02'),
    (315, 7, 'Hemoglobin (g/dL)', 9.80, '2024-02-20'),
    (316, 7, 'Ferritin (ng/mL)', 8.00, '2024-02-20'),
    (317, 7, 'Hemoglobin (g/dL)', 11.90, '2024-05-22'),
    (318, 8, 'HbA1c (%)', 7.00, '2024-04-18'),
    (319, 8, 'Oxygen saturation (%)', 93.00, '2024-04-18'),
    (320, 9, 'TSH (mIU/L)', 5.80, '2024-01-12'),
    (321, 9, 'Vitamin D, 25-OH (ng/mL)', 14.00, '2024-01-12'),
    (322, 9, 'TSH (mIU/L)', 2.40, '2024-06-14'),
    (323, 9, 'Vitamin D, 25-OH (ng/mL)', 31.00, '2024-06-14'),
    (324, 10, 'Eosinophils (%)', 4.10, '2024-03-30'),
    (325, 11, 'LDL cholesterol (mg/dL)', 171.00, '2024-02-26'),
    (326, 11, 'LDL cholesterol (mg/dL)', 109.00, '2024-08-29'),
    (327, 12, 'TSH (mIU/L)', 3.20, '2024-05-06'),
    (328, 12, 'INR', 1.00, '2024-05-06'),
    (329, 13, 'Eosinophils (%)', 5.50, '2024-09-17'),
    (330, 15, 'Hemoglobin (g/dL)', 13.40, '2024-10-02');

INSERT INTO treatment_plans (treatment_plan_id, patient_id, diagnosis_id, recommended_treatment, start_date) VALUES
    (401, 1, 101, 'Metformin with diet and exercise counselling; recheck HbA1c every 6 months', '2019-04-10'),
    (402, 1, 102, 'ACE inhibitor (lisinopril); home blood-pressure log; reduce sodium', '2017-09-22'),
    (403, 2, 103, 'Statin therapy; Mediterranean-style diet; lipid panel in 6 months', '2021-02-03'),
    (404, 3, 105, 'Inhaled corticosteroid daily plus rescue inhaler; written asthma action plan', '2008-06-15'),
    (405, 4, 107, 'Triptan at onset; headache diary to identify triggers', '2020-11-19'),
    (406, 5, 108, 'Anticoagulation (apixaban); rate monitoring at each visit', '2022-01-28'),
    (407, 5, 109, 'Physical therapy twice weekly; acetaminophen as needed', '2016-08-11'),
    (408, 5, 110, 'Kidney function every 6 months; avoid NSAIDs; nephrology referral', '2023-03-07'),
    (409, 6, 111, 'SSRI (sertraline) plus weekly cognitive behavioural therapy', '2022-05-16'),
    (410, 7, 113, 'Oral iron supplementation; repeat hemoglobin in 3 months', '2024-02-20'),
    (411, 8, 114, 'Long-acting bronchodilator; pulmonary rehabilitation; annual flu vaccine', '2018-12-04'),
    (412, 9, 116, 'Levothyroxine; TSH check 6 weeks after any dose change', '2014-10-09'),
    (413, 9, 117, 'Vitamin D3 2000 IU daily for 12 weeks, then recheck level', '2024-01-12'),
    (414, 11, 119, 'ACE inhibitor; home blood-pressure monitoring', '2019-06-18'),
    (415, 11, 120, 'Statin therapy; recheck lipid panel in 6 months', '2022-10-05'),
    (416, 12, 121, 'Reduced-dose anticoagulation due to age; rate control', '2021-08-14'),
    (417, 13, 123, 'Rescue inhaler with spacer; school asthma plan', '2016-05-04'),
    (418, 14, 124, 'Lifestyle measures and headache diary; review in 3 months', '2024-06-21');

-- Helpful indexes on foreign-key columns (PostgreSQL does not create these automatically)
CREATE INDEX diagnoses_patient_id_idx          ON diagnoses (patient_id);
CREATE INDEX medications_patient_id_idx        ON medications (patient_id);
CREATE INDEX lab_results_patient_id_idx        ON lab_results (patient_id);
CREATE INDEX treatment_plans_patient_id_idx    ON treatment_plans (patient_id);
CREATE INDEX treatment_plans_diagnosis_id_idx  ON treatment_plans (diagnosis_id);

COMMIT;

-- Teaching notes
--   * Patient 15 (Sofia Rossi) has a lab result but no diagnoses, so LEFT JOIN shows NULLs.
--   * Patient 14 (Marcus Bell) has no insurance (NULL) and no medications.
--   * Several patients have repeated lab tests, which suits GROUP BY / MIN / MAX / AVG.
--
-- Quick check (optional): row counts per table
-- SELECT 'patients' AS table_name, COUNT(*) FROM patients
-- UNION ALL SELECT 'diagnoses', COUNT(*) FROM diagnoses
-- UNION ALL SELECT 'medications', COUNT(*) FROM medications
-- UNION ALL SELECT 'lab_results', COUNT(*) FROM lab_results
-- UNION ALL SELECT 'treatment_plans', COUNT(*) FROM treatment_plans;
