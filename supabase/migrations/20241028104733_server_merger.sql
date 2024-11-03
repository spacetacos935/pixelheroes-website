CREATE TABLE "clusters" (
    "id" SERIAL PRIMARY KEY,
    "region" TEXT NOT NULL,
    "serverStart" INTEGER NOT NULL,
    "serverEnd" INTEGER NOT NULL
);

INSERT INTO "clusters" (region, "serverStart", "serverEnd")
VALUES
    ('NA', 6001, 6007),
    ('NA', 6008, 6018),
    ('NA', 6019, 6030),
    ('NA', 6031, 6042),
    ('NA', 6043, 6055),
    ('NA', 6056, 6069),
    ('NA', 6070, 6079),
    ('NA', 6080, 6087),
    ('NA', 6088, 6094),
    ('NA', 6095, 6100),
    ('EU', 3001, 3007),
    ('EU', 3008, 3012),
    ('EU', 3013, 3017),
    ('EU', 3018, 3027),
    ('EU', 3028, 3039),
    ('EU', 3040, 3050),
    ('EU', 3051, 3060),
    ('EU', 3061, 3071),
    ('EU', 3072, 3080);