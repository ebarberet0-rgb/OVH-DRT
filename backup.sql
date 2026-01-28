--
-- PostgreSQL database dump
--

\restrict vFp0f2KHLLEokQ1Gg9KoO2ffwrA9KILoMim2DmWtKZ4lZ8QpsxbxCZMfIyKfRXx

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: BookingSource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingSource" AS ENUM (
    'WEBSITE',
    'TABLET',
    'DEALER_SITE'
);


ALTER TYPE public."BookingSource" OWNER TO postgres;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'RESERVED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."BookingStatus" OWNER TO postgres;

--
-- Name: EventType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."EventType" AS ENUM (
    'DEALERSHIP',
    'PUBLIC_EVENT'
);


ALTER TYPE public."EventType" OWNER TO postgres;

--
-- Name: LicenseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LicenseType" AS ENUM (
    'A',
    'A2',
    'A1'
);


ALTER TYPE public."LicenseType" OWNER TO postgres;

--
-- Name: MotorcycleGroup; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MotorcycleGroup" AS ENUM (
    'GROUP_1',
    'GROUP_2'
);


ALTER TYPE public."MotorcycleGroup" OWNER TO postgres;

--
-- Name: MotorcycleStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MotorcycleStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'DAMAGED',
    'UNDER_REPAIR'
);


ALTER TYPE public."MotorcycleStatus" OWNER TO postgres;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'FAILED'
);


ALTER TYPE public."NotificationStatus" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'EMAIL',
    'SMS'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'DEALER',
    'INSTRUCTOR',
    'CLIENT'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AppSetting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AppSetting" (
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "isPublic" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedBy" text
);


ALTER TABLE public."AppSetting" OWNER TO postgres;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "eventId" text NOT NULL,
    "sessionId" text NOT NULL,
    "motorcycleId" text NOT NULL,
    status public."BookingStatus" DEFAULT 'RESERVED'::public."BookingStatus" NOT NULL,
    source public."BookingSource" NOT NULL,
    "hasSignedWaiver" boolean DEFAULT false NOT NULL,
    "hasPhotoConsent" boolean DEFAULT false NOT NULL,
    "licensePhotoFrontUrl" text,
    "licensePhotoBackUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "cancelledAt" timestamp(3) without time zone
);


ALTER TABLE public."Booking" OWNER TO postgres;

--
-- Name: ClientSatisfactionForm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ClientSatisfactionForm" (
    id text NOT NULL,
    "bookingId" text NOT NULL,
    "userId" text NOT NULL,
    "eventId" text NOT NULL,
    "overallRating" integer NOT NULL,
    "motorcycleRating" integer NOT NULL,
    "instructorRating" integer NOT NULL,
    "organizationRating" integer NOT NULL,
    "purchaseIntent" text NOT NULL,
    "purchaseTimeframe" text,
    comments text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClientSatisfactionForm" OWNER TO postgres;

--
-- Name: DRTTeamReport; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DRTTeamReport" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "reportedBy" text NOT NULL,
    "leadTreatmentScore" double precision NOT NULL,
    "animationScore" double precision NOT NULL,
    "teamEngagementScore" double precision NOT NULL,
    "communicationScore" double precision NOT NULL,
    "clientSatisfactionScore" double precision NOT NULL,
    "totalScore" double precision NOT NULL,
    "photoUrls" text[],
    "dealerInvestmentNotes" text NOT NULL,
    "animationNotes" text NOT NULL,
    "salesNotes" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DRTTeamReport" OWNER TO postgres;

--
-- Name: Dealer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Dealer" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    region text NOT NULL,
    "winteamUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public."Dealer" OWNER TO postgres;

--
-- Name: DealerSatisfactionForm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DealerSatisfactionForm" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "dealerId" text NOT NULL,
    "organizationRating" integer NOT NULL,
    "teamRating" integer NOT NULL,
    "animationsDescription" text NOT NULL,
    "promotionsOffered" text NOT NULL,
    "salesCount" integer NOT NULL,
    "wouldParticipateAgain" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."DealerSatisfactionForm" OWNER TO postgres;

--
-- Name: EmailTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EmailTemplate" (
    id text NOT NULL,
    key text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    variables text[],
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."EmailTemplate" OWNER TO postgres;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    name text NOT NULL,
    type public."EventType" NOT NULL,
    "dealerId" text,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    "postalCode" text NOT NULL,
    latitude double precision,
    longitude double precision,
    "maxSlotsPerSession" integer DEFAULT 7 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: EventInstructor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."EventInstructor" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "instructorId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."EventInstructor" OWNER TO postgres;

--
-- Name: Motorcycle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Motorcycle" (
    id text NOT NULL,
    model text NOT NULL,
    "plateNumber" text NOT NULL,
    "bikeNumber" integer NOT NULL,
    "group" public."MotorcycleGroup" NOT NULL,
    status public."MotorcycleStatus" DEFAULT 'AVAILABLE'::public."MotorcycleStatus" NOT NULL,
    "imageUrl" text NOT NULL,
    "requiredLicense" public."LicenseType" NOT NULL,
    "isYAMT" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Motorcycle" OWNER TO postgres;

--
-- Name: MotorcycleAvailability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MotorcycleAvailability" (
    id text NOT NULL,
    "motorcycleId" text NOT NULL,
    "eventId" text NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."MotorcycleAvailability" OWNER TO postgres;

--
-- Name: MotorcycleDamage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MotorcycleDamage" (
    id text NOT NULL,
    "motorcycleId" text NOT NULL,
    "reportedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "reportedBy" text NOT NULL,
    description text NOT NULL,
    "estimatedRepairDate" timestamp(3) without time zone,
    "repairedAt" timestamp(3) without time zone
);


ALTER TABLE public."MotorcycleDamage" OWNER TO postgres;

--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    type public."NotificationType" NOT NULL,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    recipient text NOT NULL,
    subject text,
    content text NOT NULL,
    "templateId" text,
    "sentAt" timestamp(3) without time zone,
    "failedAt" timestamp(3) without time zone,
    "errorMessage" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "group" public."MotorcycleGroup" NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "availableSlots" integer DEFAULT 7 NOT NULL,
    "bookedSlots" integer DEFAULT 0 NOT NULL,
    "instructorId" text
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text NOT NULL,
    role public."UserRole" DEFAULT 'CLIENT'::public."UserRole" NOT NULL,
    "postalCode" text,
    city text,
    "currentBrand" text,
    "currentModel" text,
    "licenseType" public."LicenseType",
    "licenseNumber" text,
    "licenseIssueDate" timestamp(3) without time zone,
    "licenseExpiryDate" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: WebsiteAnalytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WebsiteAnalytics" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "userId" text,
    source text,
    campaign text,
    device text,
    browser text,
    "landingPage" text NOT NULL,
    "exitPage" text,
    "pagesVisited" integer DEFAULT 1 NOT NULL,
    "timeSpent" integer,
    "hasBooked" boolean DEFAULT false NOT NULL,
    "bookingId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WebsiteAnalytics" OWNER TO postgres;

--
-- Name: _MotorcycleToSession; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_MotorcycleToSession" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_MotorcycleToSession" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AppSetting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AppSetting" (key, value, description, "isPublic", "updatedAt", "updatedBy") FROM stdin;
smtp_config	{"host":"smtp.gmail.com","port":587,"secure":false,"user":"ebarberet0@gmail.com","pass":"rtdy hqzl cspq rspu","from":"Yamaha Demo Ride Tour <noreply@yamaha-drt.fr>"}	SMTP Configuration updated via Admin Panel	f	2026-01-27 15:40:16.034	cmkcltur300004b418auf5jxr
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Booking" (id, "userId", "eventId", "sessionId", "motorcycleId", status, source, "hasSignedWaiver", "hasPhotoConsent", "licensePhotoFrontUrl", "licensePhotoBackUrl", "createdAt", "updatedAt", "cancelledAt") FROM stdin;
cmkcq35r20003dbch0m27tf6z	cmkcq35p60000dbchx5qohim1	cmkcn09y300061dcn9nb1z51i	cmkcn09y300081dcn140fc7a3	cmkclu13g0002xdvb4vedwslg	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-13 15:04:28.383	2026-01-27 14:07:39.117	\N
cmkwomysi000byownsn0hh1ku	cmkcq35p60000dbchx5qohim1	cmkcn09y300061dcn9nb1z51i	cmkcn09y300091dcnag27u2pj	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 14:19:16.77	2026-01-27 14:19:23.589	\N
cmkwvauek0001zn3r113ambp3	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw1000k4b41agkxq6e9	cmkclu13o0004xdvb0p3sfop7	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 17:25:48.524	2026-01-27 17:35:02.698	\N
cmkwvfic10007zn3riujsv3qt	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw1000k4b41agkxq6e9	cmkclu149000axdvbgw36vqnq	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 17:29:26.161	2026-01-27 17:54:00.961	\N
cmkx0k4fy00026z6x6dbytxgz	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw1000k4b41agkxq6e9	cmkclu13d0001xdvbwme9thz8	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 19:52:59.519	2026-01-27 19:53:57.29	\N
cmkwwur7b000cn1gs09fyn285	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw4000m4b41h47d5cqu	cmkclu1380000xdvb8lpuoasv	CONFIRMED	WEBSITE	f	f	\N	\N	2026-01-27 18:09:17.111	2026-01-27 20:02:33.676	\N
cmkwo8sqz0007yownkfx9fmhj	cmkcq35p60000dbchx5qohim1	cmkcn09y300061dcn9nb1z51i	cmkcn09y300091dcnag27u2pj	cmkclu1420008xdvbhc2oabd2	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 14:08:15.756	2026-01-27 14:24:33.459	\N
cmkwoe2os0009yown77e6kr7v	cmkcq35p60000dbchx5qohim1	cmkcn09y300061dcn9nb1z51i	cmkcn09y3000b1dcn4oco7hmx	cmkclu1420008xdvbhc2oabd2	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 14:12:21.917	2026-01-27 16:32:31.945	\N
cmkwvc0xq0005zn3r68i0hej2	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw1000k4b41agkxq6e9	cmkclu1380000xdvb8lpuoasv	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 17:26:43.646	2026-01-27 17:34:55.387	\N
cmkwvazjt0003zn3ripnck93l	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw1000k4b41agkxq6e9	cmkclu13d0001xdvbwme9thz8	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 17:25:55.194	2026-01-27 17:34:59.907	\N
cmkwsdddq0002ne8h8has72uq	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw6000o4b41ibbzroe6	cmkclu14u000gxdvbvii8n3zz	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-27 16:03:47.583	2026-01-27 18:06:52.331	\N
cmkwwklt20009n1gsltdnsged	cmkcmv67s00021dcnalafh3lb	cmkcltuvo000c4b419soacw1z	cmkcltuw1000k4b41agkxq6e9	cmkclu1380000xdvb8lpuoasv	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 18:01:23.558	2026-01-27 18:07:44.593	\N
cmkws58tk00061wr2id832vkb	cmkcmv67s00021dcnalafh3lb	cmkcltuvs000e4b41atx63127	cmkcmt50100011dcnrs72f8cz	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-27 15:57:28.424	2026-01-27 18:07:46.625	\N
cmkwrukfa00031wr2iivjwtp2	cmkwrukeg00001wr240wf09nv	cmkcltuvs000e4b41atx63127	cmkcmt50100011dcnrs72f8cz	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-27 15:49:10.247	2026-01-27 18:07:48.417	\N
cmkwrnjjn00025h5z8zk6i8vp	cmkdtypdo000plw0t4duu1v73	cmkcltuvs000e4b41atx63127	cmkcmt50100011dcnrs72f8cz	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-27 15:43:42.516	2026-01-27 18:07:50.466	\N
cmkwotum4000dyownwf19shd3	cmkcq35p60000dbchx5qohim1	cmkcn09y300061dcn9nb1z51i	cmkcn09y300091dcnag27u2pj	cmkclu1420008xdvbhc2oabd2	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 14:24:37.948	2026-01-27 18:07:52.035	\N
cmkwjgs3d0003yown2aboc84a	cmkcre2ln0008lw0twkbler9l	cmkcltuvo000c4b419soacw1z	cmkcltuwc000s4b410w9n4j95	cmkclu1380000xdvb8lpuoasv	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 11:54:30.074	2026-01-27 18:07:53.857	\N
cmkwjg5hi0001yown97rfpwct	cmkcre2ln0008lw0twkbler9l	cmkcltuvo000c4b419soacw1z	cmkcltuw6000o4b41ibbzroe6	cmkclu1380000xdvb8lpuoasv	CANCELLED	TABLET	f	f	\N	\N	2026-01-27 11:54:00.775	2026-01-27 18:07:55.938	\N
cmkdt0qrj000mlw0txfev7y69	cmkcre2ln0008lw0twkbler9l	cmkcltuvo000c4b419soacw1z	cmkcltuvv000g4b412jfovxey	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-14 09:14:20.671	2026-01-27 18:07:58.409	\N
cmkcre2pi000blw0tyy18woh7	cmkcre2ln0008lw0twkbler9l	cmkcltuvo000c4b419soacw1z	cmkcltuvv000g4b412jfovxey	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-13 15:40:57.27	2026-01-27 18:08:00.329	\N
cmkcmv69b00051dcnmjfni3ka	cmkcmv67s00021dcnalafh3lb	cmkcltuvs000e4b41atx63127	cmkcmt50100011dcnrs72f8cz	cmkclu14j000dxdvbfl2xoxjc	CANCELLED	WEBSITE	f	f	\N	\N	2026-01-13 13:34:16.943	2026-01-27 18:08:02.776	\N
\.


--
-- Data for Name: ClientSatisfactionForm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ClientSatisfactionForm" (id, "bookingId", "userId", "eventId", "overallRating", "motorcycleRating", "instructorRating", "organizationRating", "purchaseIntent", "purchaseTimeframe", comments, "createdAt") FROM stdin;
\.


--
-- Data for Name: DRTTeamReport; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DRTTeamReport" (id, "eventId", "reportedBy", "leadTreatmentScore", "animationScore", "teamEngagementScore", "communicationScore", "clientSatisfactionScore", "totalScore", "photoUrls", "dealerInvestmentNotes", "animationNotes", "salesNotes", "createdAt") FROM stdin;
\.


--
-- Data for Name: Dealer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Dealer" (id, name, email, phone, address, city, "postalCode", region, "winteamUrl", "createdAt", "updatedAt", latitude, longitude) FROM stdin;
cmkcltuur00034b41apn6p66x	Yamaha Paris Nord	contact@yamaha-paris-nord.fr	+33145678901	123 Avenue de la République	Paris	75011	Île-de-France	https://yamaha-paris-nord.fr	2026-01-13 13:05:15.892	2026-01-13 13:05:15.892	\N	\N
cmkcltuuv00044b41pz2mop6u	Yamaha Lyon Centre	contact@yamaha-lyon.fr	+33478901234	45 Rue de la Liberté	Lyon	69003	Auvergne-Rhône-Alpes	https://yamaha-lyon.fr	2026-01-13 13:05:15.896	2026-01-13 13:05:15.896	\N	\N
\.


--
-- Data for Name: DealerSatisfactionForm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DealerSatisfactionForm" (id, "eventId", "dealerId", "organizationRating", "teamRating", "animationsDescription", "promotionsOffered", "salesCount", "wouldParticipateAgain", "createdAt") FROM stdin;
\.


--
-- Data for Name: EmailTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EmailTemplate" (id, key, subject, content, variables, description, "createdAt", "updatedAt") FROM stdin;
cmkwq0rzh0000rku8tjhlh7hh	BOOKING_CONFIRMATION	Confirmation de votre réservation Yamaha Demo Ride Tour - {{EVENT_NAME}}	\n      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">\n        <h2 style="color: #E60012;">Confirmation de réservation</h2>\n        <p>Bonjour <strong>{{USER_FIRSTNAME}}</strong>,</p>\n        \n        <p>Nous vous confirmons votre réservation pour essayer la <strong>{{MOTORCYCLE_MODEL}}</strong> lors de l'événement <strong>{{EVENT_NAME}}</strong>.</p>\n        \n        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">\n          <p style="margin: 5px 0;"><strong>Date :</strong> {{DATE}}</p>\n          <p style="margin: 5px 0;"><strong>Heure :</strong> {{TIME}}</p>\n          <p style="margin: 5px 0;"><strong>Lieu :</strong> {{LOCATION_ADDRESS}}, {{LOCATION_CITY}}</p>\n          <p style="margin: 5px 0;"><strong>Concessionnaire :</strong> {{DEALER_NAME}}</p>\n        </div>\n\n        <p>Merci de vous présenter 15 minutes avant le début de votre essai, muni de votre :</p>\n        <ul>\n          <li>Permis de conduire valide</li>\n          <li>Équipement de moto (casque et gants homologués obligatoires)</li>\n        </ul>\n\n        <p>Pour modifier ou annuler votre réservation, veuillez nous contacter ou utiliser le lien ci-dessous :</p>\n        <p><a href="{{CANCEL_LINK}}" style="color: #E60012;">Gérer ma réservation</a></p>\n\n        <p>À très vite sur les routes !</p>\n        <p>L'équipe Yamaha Demo Ride Tour</p>\n      </div>\n    	{USER_FIRSTNAME,EVENT_NAME,MOTORCYCLE_MODEL,DATE,TIME,LOCATION_ADDRESS,LOCATION_CITY,DEALER_NAME,CANCEL_LINK}	Email envoyé automatiquement après une réservation confirmée	2026-01-27 14:58:00.749	2026-01-27 15:42:38.739
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, name, type, "dealerId", "startDate", "endDate", address, city, "postalCode", latitude, longitude, "maxSlotsPerSession", "createdAt", "updatedAt") FROM stdin;
cmkcltuvo000c4b419soacw1z	Demo Ride Tour - Paris Nord	DEALERSHIP	cmkcltuur00034b41apn6p66x	2026-03-14 08:00:00	2026-03-15 17:00:00	123 Avenue de la République	Paris	75011	48.8566	2.3522	7	2026-01-13 13:05:15.924	2026-01-13 13:05:15.924
cmkcltuvs000e4b41atx63127	Demo Ride Tour - Lyon Centre	PUBLIC_EVENT	cmkcltuuv00044b41pz2mop6u	2026-03-21 00:00:00	2026-03-22 00:00:00	45 Rue de la Liberté	Lyon	69003	45.764	4.8357	6	2026-01-13 13:05:15.928	2026-01-13 13:14:06.987
cmkcn09y300061dcn9nb1z51i	Demo ride tour TOULOUSE	PUBLIC_EVENT	\N	2026-02-03 00:00:00	2026-02-03 00:00:00	6 rue louis bonin	toulouse	31200	43.6279054	1.4106786	6	2026-01-13 13:38:15.002	2026-01-13 13:39:09.113
\.


--
-- Data for Name: EventInstructor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."EventInstructor" (id, "eventId", "instructorId", "assignedAt") FROM stdin;
cmkcmmwx4000jnt818oyvulvk	cmkcltuvo000c4b419soacw1z	cmkcltuun00024b41mqtkzh44	2026-01-13 13:27:51.593
cmkcmn0zj000lnt81kb439vo6	cmkcltuvs000e4b41atx63127	cmkcltusy00014b41nwzqby60	2026-01-13 13:27:56.864
cmkcrjcf2000dlw0ta08yhtef	cmkcn09y300061dcn9nb1z51i	cmkcltuun00024b41mqtkzh44	2026-01-13 15:45:03.135
\.


--
-- Data for Name: Motorcycle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Motorcycle" (id, model, "plateNumber", "bikeNumber", "group", status, "imageUrl", "requiredLicense", "isYAMT", "createdAt", "updatedAt") FROM stdin;
cmkclu155000jxdvba2vvtnrq	FJR1300	AB-142-CD	20	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	f	2026-01-13 13:05:24.042	2026-01-13 15:52:33.209
cmkclu13g0002xdvb4vedwslg	MT-09	AB-125-CD	3	GROUP_2	DAMAGED	https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=800&q=80	A	f	2026-01-13 13:05:23.98	2026-01-27 17:56:34.833
cmkclu14j000dxdvbfl2xoxjc	TMAX 560 Tech MAX	AB-136-CD	14	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	t	2026-01-13 13:05:24.02	2026-01-13 13:05:24.02
cmkclu14n000exdvbynz1fh9t	XMAX 300	AB-137-CD	15	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A2	t	2026-01-13 13:05:24.023	2026-01-13 13:05:24.023
cmkclu1380000xdvb8lpuoasv	YZF-R1	AB-123-CD	1	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80	A	f	2026-01-13 13:05:23.973	2026-01-13 13:05:23.973
cmkclu13d0001xdvbwme9thz8	YZF-R7	AB-124-CD	2	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1599819177272-e96ed43bdc0b?w=800&q=80	A	f	2026-01-13 13:05:23.977	2026-01-13 13:05:23.977
cmkclu13j0003xdvb8xdp42do	MT-10	AB-126-CD	4	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80	A	f	2026-01-13 13:05:23.984	2026-01-13 13:05:23.984
cmkclu13o0004xdvb0p3sfop7	XSR900	AB-127-CD	5	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	f	2026-01-13 13:05:23.988	2026-01-13 13:05:23.988
cmkclu13r0005xdvbry9tpay7	XSR700	AB-128-CD	6	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	f	2026-01-13 13:05:23.992	2026-01-13 13:05:23.992
cmkclu13u0006xdvby8njiqgc	Tracer 9 GT	AB-129-CD	7	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	f	2026-01-13 13:05:23.995	2026-01-13 13:05:23.995
cmkclu13y0007xdvbe0c5nsni	Ténéré 700	AB-130-CD	8	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80	A	f	2026-01-13 13:05:23.999	2026-01-13 13:05:23.999
cmkclu1420008xdvbhc2oabd2	MT-07	AB-131-CD	9	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1599819177272-e96ed43bdc0b?w=800&q=80	A2	f	2026-01-13 13:05:24.002	2026-01-13 13:05:24.002
cmkclu1460009xdvb12mxxbv4	YZF-R3	AB-132-CD	10	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80	A2	f	2026-01-13 13:05:24.006	2026-01-13 13:05:24.006
cmkclu149000axdvbgw36vqnq	XSR700 (A2)	AB-133-CD	11	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A2	f	2026-01-13 13:05:24.009	2026-01-13 13:05:24.009
cmkclu14c000bxdvbi3t35wf2	MT-125	AB-134-CD	12	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1599819177272-e96ed43bdc0b?w=800&q=80	A1	f	2026-01-13 13:05:24.013	2026-01-13 13:05:24.013
cmkclu14g000cxdvbo53167d0	YZF-R125	AB-135-CD	13	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800&q=80	A1	f	2026-01-13 13:05:24.016	2026-01-13 13:05:24.016
cmkclu14r000fxdvbyu99tzst	NMAX 125	AB-138-CD	16	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A1	t	2026-01-13 13:05:24.027	2026-01-13 13:05:24.027
cmkclu14u000gxdvbvii8n3zz	MT-09 SP	AB-139-CD	17	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1558980664-10e7170b5df9?w=800&q=80	A	f	2026-01-13 13:05:24.03	2026-01-13 13:05:24.03
cmkclu14y000hxdvbqmsdr36c	Tracer 7 GT	AB-140-CD	18	GROUP_2	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	f	2026-01-13 13:05:24.034	2026-01-13 13:05:24.034
cmkclu152000ixdvbunszvzbo	XSR900 GP	AB-141-CD	19	GROUP_1	AVAILABLE	https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80	A	f	2026-01-13 13:05:24.038	2026-01-13 13:05:24.038
\.


--
-- Data for Name: MotorcycleAvailability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MotorcycleAvailability" (id, "motorcycleId", "eventId", "isAvailable") FROM stdin;
cmkcn49wg000o1dcnquyk9eri	cmkclu14j000dxdvbfl2xoxjc	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000p1dcnn063qruo	cmkclu14n000exdvbynz1fh9t	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000q1dcnzlcbddzg	cmkclu13g0002xdvb4vedwslg	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000r1dcnki2yg2ro	cmkclu13j0003xdvb8xdp42do	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000s1dcnhwtbklv0	cmkclu13o0004xdvb0p3sfop7	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000t1dcnn0phbrju	cmkclu13r0005xdvbry9tpay7	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000u1dcnkwq1u5k2	cmkclu13u0006xdvby8njiqgc	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000v1dcn2cug8fm6	cmkclu13y0007xdvbe0c5nsni	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000w1dcnsh4zcspo	cmkclu1420008xdvbhc2oabd2	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000x1dcne87u85r6	cmkclu14c000bxdvbi3t35wf2	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000y1dcncse3yk6a	cmkclu14g000cxdvbo53167d0	cmkcltuvs000e4b41atx63127	t
cmkcn49wg000z1dcng308y1bg	cmkclu14r000fxdvbyu99tzst	cmkcltuvs000e4b41atx63127	t
cmkcn49wg00101dcnvue4m7wx	cmkclu14u000gxdvbvii8n3zz	cmkcltuvs000e4b41atx63127	t
cmkcn49wg00111dcnple6vo8r	cmkclu14y000hxdvbqmsdr36c	cmkcltuvs000e4b41atx63127	t
cmkcn49wg00121dcnojh4p78k	cmkclu155000jxdvba2vvtnrq	cmkcltuvs000e4b41atx63127	t
cmkcrnrqu000flw0tls7bldwm	cmkclu155000jxdvba2vvtnrq	cmkcn09y300061dcn9nb1z51i	t
cmkcrnrqu000glw0tpiacufi4	cmkclu1420008xdvbhc2oabd2	cmkcn09y300061dcn9nb1z51i	t
cmkcrnrqu000hlw0tf0rox0m0	cmkclu13g0002xdvb4vedwslg	cmkcn09y300061dcn9nb1z51i	t
cmkcrnrqu000ilw0twm4wxd03	cmkclu14r000fxdvbyu99tzst	cmkcn09y300061dcn9nb1z51i	t
cmkcrnrqu000jlw0tjv8sdel7	cmkclu14j000dxdvbfl2xoxjc	cmkcn09y300061dcn9nb1z51i	t
cmkcmnzu3000nnt81fyf7xdyj	cmkclu14j000dxdvbfl2xoxjc	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000ont81e93zilck	cmkclu14n000exdvbynz1fh9t	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000pnt81rv58cki2	cmkclu1380000xdvb8lpuoasv	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000qnt81rzc3dts8	cmkclu13d0001xdvbwme9thz8	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000rnt81c67nl2ij	cmkclu13g0002xdvb4vedwslg	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000snt81vpq68p4e	cmkclu13j0003xdvb8xdp42do	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000tnt81jyl8vbzc	cmkclu13o0004xdvb0p3sfop7	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000unt819dd7zl2n	cmkclu13r0005xdvbry9tpay7	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000vnt81nni1zskd	cmkclu13u0006xdvby8njiqgc	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000wnt813hfrx36v	cmkclu13y0007xdvbe0c5nsni	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000xnt81iozf0gcx	cmkclu1420008xdvbhc2oabd2	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000ynt81m2g5jifk	cmkclu1460009xdvb12mxxbv4	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu3000znt812pcz16v3	cmkclu149000axdvbgw36vqnq	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30010nt81jsqqs086	cmkclu14c000bxdvbi3t35wf2	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30011nt81uwq4x7xb	cmkclu14g000cxdvbo53167d0	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30012nt81fe7rvepx	cmkclu14r000fxdvbyu99tzst	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30013nt81x5ny7g8b	cmkclu14u000gxdvbvii8n3zz	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30014nt815zny5ajh	cmkclu14y000hxdvbqmsdr36c	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30015nt81iarc5qfa	cmkclu152000ixdvbunszvzbo	cmkcltuvo000c4b419soacw1z	t
cmkcmnzu30016nt819wq67wq0	cmkclu155000jxdvba2vvtnrq	cmkcltuvo000c4b419soacw1z	t
\.


--
-- Data for Name: MotorcycleDamage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MotorcycleDamage" (id, "motorcycleId", "reportedAt", "reportedBy", description, "estimatedRepairDate", "repairedAt") FROM stdin;
cmkwo80gn0005yownr9a319ow	cmkclu13g0002xdvb4vedwslg	2026-01-27 14:07:39.093	cmkwdw6ph0000991aamc5u1xt	[MECHANICAL] rdrtdf	\N	\N
cmkwwef0z0007n1gs7lp6nl02	cmkclu13g0002xdvb4vedwslg	2026-01-27 17:56:34.833	cmkcltur300004b418auf5jxr	embrayage\n	\N	\N
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, type, status, recipient, subject, content, "templateId", "sentAt", "failedAt", "errorMessage", "createdAt") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "eventId", "group", "startTime", "endTime", "availableSlots", "bookedSlots", "instructorId") FROM stdin;
cmkcltuw9000q4b41gilu0t68	cmkcltuvo000c4b419soacw1z	GROUP_2	2026-03-14 11:30:00	2026-03-14 12:20:00	7	0	cmkcltuun00024b41mqtkzh44
cmkcltuwc000s4b410w9n4j95	cmkcltuvo000c4b419soacw1z	GROUP_1	2026-03-14 12:30:00	2026-03-14 13:20:00	7	0	cmkcltusy00014b41nwzqby60
cmkcltuwf000u4b410449n8tz	cmkcltuvo000c4b419soacw1z	GROUP_2	2026-03-14 13:00:00	2026-03-14 13:50:00	7	0	cmkcltuun00024b41mqtkzh44
cmkcltuwi000w4b41ogthut9m	cmkcltuvo000c4b419soacw1z	GROUP_1	2026-03-14 14:00:00	2026-03-14 14:50:00	7	0	cmkcltusy00014b41nwzqby60
cmkcltuwn00104b419xi9dxl3	cmkcltuvo000c4b419soacw1z	GROUP_1	2026-03-14 15:30:00	2026-03-14 16:20:00	7	0	cmkcltusy00014b41nwzqby60
cmkcltuwp00124b41vqkxrhmi	cmkcltuvo000c4b419soacw1z	GROUP_2	2026-03-14 16:00:00	2026-03-14 16:50:00	7	0	cmkcltuun00024b41mqtkzh44
cmkcltuvz000i4b41qdriamzu	cmkcltuvo000c4b419soacw1z	GROUP_2	2026-03-14 08:30:00	2026-03-14 09:20:00	7	0	cmkcltusy00014b41nwzqby60
cmkcn09y300091dcnag27u2pj	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 09:00:00	2026-02-03 09:45:00	6	0	\N
cmkcn09y3000a1dcnanunn83j	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 09:00:00	2026-02-03 09:45:00	6	0	\N
cmkcn09y3000b1dcn4oco7hmx	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 10:00:00	2026-02-03 10:45:00	6	0	\N
cmkcn09y3000c1dcn93zmwyob	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 10:00:00	2026-02-03 10:45:00	6	0	\N
cmkcn09y3000d1dcn53pbbbg9	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 13:00:00	2026-02-03 13:45:00	6	0	\N
cmkcn09y3000e1dcnfc85hsni	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 13:00:00	2026-02-03 13:45:00	6	0	\N
cmkcn09y3000f1dcnvw4nejmz	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 14:00:00	2026-02-03 14:45:00	6	0	\N
cmkcn09y3000g1dcndxo3qjsl	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 14:00:00	2026-02-03 14:45:00	6	0	\N
cmkcn09y3000h1dcn1zvygakm	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 15:00:00	2026-02-03 15:45:00	6	0	\N
cmkcn09y3000i1dcn30y32mdo	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 15:00:00	2026-02-03 15:45:00	6	0	\N
cmkcn09y3000j1dcnyw0cql95	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 16:00:00	2026-02-03 16:45:00	6	0	\N
cmkcn09y3000k1dcnwj3wdzzz	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 16:00:00	2026-02-03 16:45:00	6	0	\N
cmkcn09y300081dcn140fc7a3	cmkcn09y300061dcn9nb1z51i	GROUP_2	2026-02-03 08:00:00	2026-02-03 08:45:00	6	1	\N
cmkcn09y300071dcn6x5kbs7f	cmkcn09y300061dcn9nb1z51i	GROUP_1	2026-02-03 08:00:00	2026-02-03 08:45:00	6	0	cmkcltuun00024b41mqtkzh44
cmkcltuvv000g4b412jfovxey	cmkcltuvo000c4b419soacw1z	GROUP_1	2026-03-14 08:00:00	2026-03-14 08:50:00	7	2	cmkcltusy00014b41nwzqby60
cmkcltuw6000o4b41ibbzroe6	cmkcltuvo000c4b419soacw1z	GROUP_1	2026-03-14 11:00:00	2026-03-14 11:50:00	7	1	cmkcltusy00014b41nwzqby60
cmkcltuw4000m4b41h47d5cqu	cmkcltuvo000c4b419soacw1z	GROUP_2	2026-03-14 10:00:00	2026-03-14 10:50:00	7	1	cmkcltuun00024b41mqtkzh44
cmkcltuw1000k4b41agkxq6e9	cmkcltuvo000c4b419soacw1z	GROUP_1	2026-03-14 09:00:00	2026-03-14 10:00:00	7	6	cmkcltusy00014b41nwzqby60
cmkx0ufvc00046z6x7b9z6aj2	cmkcltuvs000e4b41atx63127	GROUP_1	2026-01-27 11:00:00	2026-01-27 11:50:00	7	0	cmkcltuun00024b41mqtkzh44
cmkcmt50100011dcnrs72f8cz	cmkcltuvs000e4b41atx63127	GROUP_2	2026-01-27 13:30:00	2026-01-27 14:32:00	7	4	cmkcltuun00024b41mqtkzh44
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, "firstName", "lastName", phone, role, "postalCode", city, "currentBrand", "currentModel", "licenseType", "licenseNumber", "licenseIssueDate", "licenseExpiryDate", "createdAt", "updatedAt") FROM stdin;
cmkcltur300004b418auf5jxr	heloise@yamaha.fr	$2b$10$r2Gwiu8Q2omsuFZW7Uzx4eTncsTdM5orIp5ZR78cbRwhf21pZIg1.	Héloïse	Admin	+33612345678	ADMIN	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 13:05:15.76	2026-01-13 13:05:15.76
cmkcltusy00014b41nwzqby60	instructor1@yamaha.fr	$2b$10$31NAv4AgEeXTxXRkR2yiPOEoB4mGx08gliBckqcIqpXzNHmLhHXK.	Jean	Martin	+33623456789	INSTRUCTOR	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 13:05:15.826	2026-01-13 13:05:15.826
cmkcltuun00024b41mqtkzh44	instructor2@yamaha.fr	$2b$10$EDJo0nvWbZ5Z38MEcbe7Y.UqufOt88U1n.7X4c.xvM2eRHhBl01dq	Marie	Dupont	+33634567890	INSTRUCTOR	\N	\N	\N	\N	\N	\N	\N	\N	2026-01-13 13:05:15.888	2026-01-13 13:05:15.888
cmkcltv0j001r4b41rvjo8e3e	client1@example.com	$2b$10$c4emNt0FVxC7RabgCRZOH.ZSzh9yD/X06yNxHwuANYVvAXGlCB7Fi	Pierre	Durand	+33698765432	CLIENT	75001	Paris	\N	\N	A2	\N	\N	\N	2026-01-13 13:05:16.099	2026-01-13 13:05:16.099
cmkcltv0j001s4b4173d8ejx0	client2@example.com	$2b$10$WFupy6kNIYvdMmysAmUJYeDgmHawHZPW547UiOgVTD11D0iNFWj3m	Sophie	Bernard	+33687654321	CLIENT	69001	Lyon	Honda	CB650R	A	\N	\N	\N	2026-01-13 13:05:16.099	2026-01-13 13:05:16.099
cmkwrukeg00001wr240wf09nv	eric@barbere.fr	$2b$10$AeZ2j.BXG49jRcxRq1wEleC6AdMxbr3fHg1E6PEoNKbrY6cIzAbbS	zazaz	dzdzad	+33622558877	CLIENT	\N	\N	\N	\N	A	\N	\N	\N	2026-01-27 15:49:10.217	2026-01-27 15:49:10.217
cmkcq35p60000dbchx5qohim1	dsfsd@fdzfs.fr	$2b$10$inSD8.TaKM7a3w14kuCvEexL0CO/Tw6jfyvkKULOUmFxv67E2iFH.	fggh	bjkbhjk	+33625544666	CLIENT	\N	\N	\N	\N	A	\N	\N	\N	2026-01-13 15:04:28.315	2026-01-27 14:24:37.931
cmkcre2ln0008lw0twkbler9l	pmoity@winteam.fr	$2b$10$Or9IyjcZxBMB3Jepyhx2qOE7yZI3fUdlxiYsSTkXZyBQV3HcPMLKy	pierre	Moity	+33655447788	CLIENT	\N	\N	\N	\N	A	\N	\N	\N	2026-01-13 15:40:57.131	2026-01-27 17:31:17.722
cmkcmv67s00021dcnalafh3lb	e.barberet@urbalyon.org	$2b$10$3kRduOb6v9l3Eim9KHBLou6Gq4Q/uZXzG1Kvoi5X9Sz2xlf58a6y2	aaaaa	bbbb	+33622554477	CLIENT	\N	\N	\N	\N	A	\N	\N	\N	2026-01-13 13:34:16.889	2026-01-27 19:52:59.492
cmkdtypdo000plw0t4duu1v73	eric@barberet.fr	$2b$10$B4CmGPVwstxJWoInT2zXCuAZ7NA2mxsG4TObinzlotG1GTGwk4Giy	Eric	BARBERET	+33625798844	ADMIN	\N	\N	\N	\N	A	\N	\N	\N	2026-01-14 09:40:45.18	2026-01-27 19:59:55.793
\.


--
-- Data for Name: WebsiteAnalytics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."WebsiteAnalytics" (id, "sessionId", "userId", source, campaign, device, browser, "landingPage", "exitPage", "pagesVisited", "timeSpent", "hasBooked", "bookingId", "createdAt") FROM stdin;
\.


--
-- Data for Name: _MotorcycleToSession; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_MotorcycleToSession" ("A", "B") FROM stdin;
cmkclu14j000dxdvbfl2xoxjc	cmkx0ufvc00046z6x7b9z6aj2
cmkclu13o0004xdvb0p3sfop7	cmkx0ufvc00046z6x7b9z6aj2
cmkclu13u0006xdvby8njiqgc	cmkx0ufvc00046z6x7b9z6aj2
cmkclu1420008xdvbhc2oabd2	cmkx0ufvc00046z6x7b9z6aj2
cmkclu14g000cxdvbo53167d0	cmkx0ufvc00046z6x7b9z6aj2
cmkclu14r000fxdvbyu99tzst	cmkx0ufvc00046z6x7b9z6aj2
cmkclu14u000gxdvbvii8n3zz	cmkx0ufvc00046z6x7b9z6aj2
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
416f69f4-1ea5-4a35-9dd0-1502457a8a5c	dfca8068e1468f9d741bceeec088d874bdeb2fff05af405f0d95724a7ca7c4be	2026-01-11 10:36:24.410669+00	20260111103623_init	\N	\N	2026-01-11 10:36:23.153619+00	1
f6ed4471-fbfc-4381-aa19-87896ee23723	f1bd1d4bb1dc52f4bdb9fc6b403f3211ac0437af751942b29da6666cd5d5482c	2026-01-11 12:33:15.028236+00	20260111123315_add_dealer_coordinates	\N	\N	2026-01-11 12:33:15.019712+00	1
1357c7ca-2c8a-4f2e-b639-8669a6c34570	94fde4af7c8a8120efd3a968e6b940af5fbb62da141778444497c12d7c30ff85	2026-01-11 20:30:07.278713+00	20260111203007_add_event_instructor_relation	\N	\N	2026-01-11 20:30:07.244493+00	1
\.


--
-- Name: AppSetting AppSetting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AppSetting"
    ADD CONSTRAINT "AppSetting_pkey" PRIMARY KEY (key);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: ClientSatisfactionForm ClientSatisfactionForm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSatisfactionForm"
    ADD CONSTRAINT "ClientSatisfactionForm_pkey" PRIMARY KEY (id);


--
-- Name: DRTTeamReport DRTTeamReport_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DRTTeamReport"
    ADD CONSTRAINT "DRTTeamReport_pkey" PRIMARY KEY (id);


--
-- Name: DealerSatisfactionForm DealerSatisfactionForm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerSatisfactionForm"
    ADD CONSTRAINT "DealerSatisfactionForm_pkey" PRIMARY KEY (id);


--
-- Name: Dealer Dealer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Dealer"
    ADD CONSTRAINT "Dealer_pkey" PRIMARY KEY (id);


--
-- Name: EmailTemplate EmailTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EmailTemplate"
    ADD CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY (id);


--
-- Name: EventInstructor EventInstructor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventInstructor"
    ADD CONSTRAINT "EventInstructor_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: MotorcycleAvailability MotorcycleAvailability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MotorcycleAvailability"
    ADD CONSTRAINT "MotorcycleAvailability_pkey" PRIMARY KEY (id);


--
-- Name: MotorcycleDamage MotorcycleDamage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MotorcycleDamage"
    ADD CONSTRAINT "MotorcycleDamage_pkey" PRIMARY KEY (id);


--
-- Name: Motorcycle Motorcycle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Motorcycle"
    ADD CONSTRAINT "Motorcycle_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WebsiteAnalytics WebsiteAnalytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WebsiteAnalytics"
    ADD CONSTRAINT "WebsiteAnalytics_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Booking_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_createdAt_idx" ON public."Booking" USING btree ("createdAt");


--
-- Name: Booking_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_eventId_idx" ON public."Booking" USING btree ("eventId");


--
-- Name: Booking_sessionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_sessionId_idx" ON public."Booking" USING btree ("sessionId");


--
-- Name: Booking_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_status_idx" ON public."Booking" USING btree (status);


--
-- Name: Booking_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Booking_userId_idx" ON public."Booking" USING btree ("userId");


--
-- Name: ClientSatisfactionForm_bookingId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ClientSatisfactionForm_bookingId_key" ON public."ClientSatisfactionForm" USING btree ("bookingId");


--
-- Name: ClientSatisfactionForm_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClientSatisfactionForm_eventId_idx" ON public."ClientSatisfactionForm" USING btree ("eventId");


--
-- Name: ClientSatisfactionForm_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ClientSatisfactionForm_userId_idx" ON public."ClientSatisfactionForm" USING btree ("userId");


--
-- Name: DRTTeamReport_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DRTTeamReport_eventId_idx" ON public."DRTTeamReport" USING btree ("eventId");


--
-- Name: DRTTeamReport_eventId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DRTTeamReport_eventId_key" ON public."DRTTeamReport" USING btree ("eventId");


--
-- Name: DealerSatisfactionForm_eventId_dealerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DealerSatisfactionForm_eventId_dealerId_key" ON public."DealerSatisfactionForm" USING btree ("eventId", "dealerId");


--
-- Name: DealerSatisfactionForm_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "DealerSatisfactionForm_eventId_idx" ON public."DealerSatisfactionForm" USING btree ("eventId");


--
-- Name: Dealer_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dealer_city_idx" ON public."Dealer" USING btree (city);


--
-- Name: Dealer_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Dealer_email_key" ON public."Dealer" USING btree (email);


--
-- Name: Dealer_region_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Dealer_region_idx" ON public."Dealer" USING btree (region);


--
-- Name: EmailTemplate_key_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EmailTemplate_key_idx" ON public."EmailTemplate" USING btree (key);


--
-- Name: EmailTemplate_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EmailTemplate_key_key" ON public."EmailTemplate" USING btree (key);


--
-- Name: EventInstructor_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EventInstructor_eventId_idx" ON public."EventInstructor" USING btree ("eventId");


--
-- Name: EventInstructor_eventId_instructorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "EventInstructor_eventId_instructorId_key" ON public."EventInstructor" USING btree ("eventId", "instructorId");


--
-- Name: EventInstructor_instructorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "EventInstructor_instructorId_idx" ON public."EventInstructor" USING btree ("instructorId");


--
-- Name: Event_city_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_city_idx" ON public."Event" USING btree (city);


--
-- Name: Event_dealerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_dealerId_idx" ON public."Event" USING btree ("dealerId");


--
-- Name: Event_startDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Event_startDate_idx" ON public."Event" USING btree ("startDate");


--
-- Name: MotorcycleAvailability_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MotorcycleAvailability_eventId_idx" ON public."MotorcycleAvailability" USING btree ("eventId");


--
-- Name: MotorcycleAvailability_motorcycleId_eventId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "MotorcycleAvailability_motorcycleId_eventId_key" ON public."MotorcycleAvailability" USING btree ("motorcycleId", "eventId");


--
-- Name: MotorcycleDamage_motorcycleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MotorcycleDamage_motorcycleId_idx" ON public."MotorcycleDamage" USING btree ("motorcycleId");


--
-- Name: MotorcycleDamage_reportedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "MotorcycleDamage_reportedAt_idx" ON public."MotorcycleDamage" USING btree ("reportedAt");


--
-- Name: Motorcycle_bikeNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Motorcycle_bikeNumber_key" ON public."Motorcycle" USING btree ("bikeNumber");


--
-- Name: Motorcycle_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Motorcycle_group_idx" ON public."Motorcycle" USING btree ("group");


--
-- Name: Motorcycle_plateNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Motorcycle_plateNumber_key" ON public."Motorcycle" USING btree ("plateNumber");


--
-- Name: Motorcycle_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Motorcycle_status_idx" ON public."Motorcycle" USING btree (status);


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Notification_status_idx" ON public."Notification" USING btree (status);


--
-- Name: Session_eventId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_eventId_idx" ON public."Session" USING btree ("eventId");


--
-- Name: Session_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_group_idx" ON public."Session" USING btree ("group");


--
-- Name: Session_startTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_startTime_idx" ON public."Session" USING btree ("startTime");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: WebsiteAnalytics_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WebsiteAnalytics_createdAt_idx" ON public."WebsiteAnalytics" USING btree ("createdAt");


--
-- Name: WebsiteAnalytics_hasBooked_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WebsiteAnalytics_hasBooked_idx" ON public."WebsiteAnalytics" USING btree ("hasBooked");


--
-- Name: WebsiteAnalytics_source_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "WebsiteAnalytics_source_idx" ON public."WebsiteAnalytics" USING btree (source);


--
-- Name: _MotorcycleToSession_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_MotorcycleToSession_AB_unique" ON public."_MotorcycleToSession" USING btree ("A", "B");


--
-- Name: _MotorcycleToSession_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_MotorcycleToSession_B_index" ON public."_MotorcycleToSession" USING btree ("B");


--
-- Name: Booking Booking_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_motorcycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES public."Motorcycle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientSatisfactionForm ClientSatisfactionForm_bookingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSatisfactionForm"
    ADD CONSTRAINT "ClientSatisfactionForm_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES public."Booking"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientSatisfactionForm ClientSatisfactionForm_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSatisfactionForm"
    ADD CONSTRAINT "ClientSatisfactionForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClientSatisfactionForm ClientSatisfactionForm_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ClientSatisfactionForm"
    ADD CONSTRAINT "ClientSatisfactionForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DRTTeamReport DRTTeamReport_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DRTTeamReport"
    ADD CONSTRAINT "DRTTeamReport_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DRTTeamReport DRTTeamReport_reportedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DRTTeamReport"
    ADD CONSTRAINT "DRTTeamReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DealerSatisfactionForm DealerSatisfactionForm_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerSatisfactionForm"
    ADD CONSTRAINT "DealerSatisfactionForm_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DealerSatisfactionForm DealerSatisfactionForm_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DealerSatisfactionForm"
    ADD CONSTRAINT "DealerSatisfactionForm_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventInstructor EventInstructor_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventInstructor"
    ADD CONSTRAINT "EventInstructor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventInstructor EventInstructor_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."EventInstructor"
    ADD CONSTRAINT "EventInstructor_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Event Event_dealerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES public."Dealer"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MotorcycleAvailability MotorcycleAvailability_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MotorcycleAvailability"
    ADD CONSTRAINT "MotorcycleAvailability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MotorcycleAvailability MotorcycleAvailability_motorcycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MotorcycleAvailability"
    ADD CONSTRAINT "MotorcycleAvailability_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES public."Motorcycle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MotorcycleDamage MotorcycleDamage_motorcycleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MotorcycleDamage"
    ADD CONSTRAINT "MotorcycleDamage_motorcycleId_fkey" FOREIGN KEY ("motorcycleId") REFERENCES public."Motorcycle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _MotorcycleToSession _MotorcycleToSession_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_MotorcycleToSession"
    ADD CONSTRAINT "_MotorcycleToSession_A_fkey" FOREIGN KEY ("A") REFERENCES public."Motorcycle"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _MotorcycleToSession _MotorcycleToSession_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_MotorcycleToSession"
    ADD CONSTRAINT "_MotorcycleToSession_B_fkey" FOREIGN KEY ("B") REFERENCES public."Session"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict vFp0f2KHLLEokQ1Gg9KoO2ffwrA9KILoMim2DmWtKZ4lZ8QpsxbxCZMfIyKfRXx

