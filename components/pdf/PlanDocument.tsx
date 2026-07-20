import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import type { Verdict, Trend } from "@/lib/types";
import type { SkillPlan } from "@/lib/plan";
import { orderedTeasers } from "@/lib/plan";
import { verdictHeadline, overallReasoning, nextMoves } from "@/lib/report";
import { brandPath, brandPngDataUrl } from "@/lib/pdf-assets";

interface Props {
  verdict: Verdict;
  plan: SkillPlan;
  qrDataUrl: string;
  siteHost: string;
}

Font.register({
  family: "Henk",
  fonts: [
    { src: brandPath("Henk-Work-Regular.otf"), fontWeight: 400 },
    { src: brandPath("Henk-Work-Bold.otf"), fontWeight: 700 },
  ],
});

const C = {
  ink: "#081430",
  inkBody: "#3f3f3f",
  inkSoft: "#8c8c8c",
  inkFaint: "#b0b5bf",
  line: "#e9e9e9",
  paper: "#ffffff",
  soft: "#f4f7f8",
  soft2: "#f7f8fa",
  indigo: "#514eea",
  indigoSoft: "#eef0ff",
  coral: "#ff5e59",
  coralTint: "#fff4f3",
  coralTint2: "#fbe0de",
  coralInk: "#cd2927",
  dark: "#081430",
  grow: "#056640",
  growTint: "#ecfef4",
  stable: "#b26a00",
  stableTint: "#fff2dc",
  decline: "#e80029",
  declineTint: "#f9e8e4",
};

const TREND: Record<Trend, { color: string; tint: string; label: string }> = {
  growing: { color: C.grow, tint: C.growTint, label: "Growing" },
  stable: { color: C.stable, tint: C.stableTint, label: "Stable" },
  declining: { color: C.decline, tint: C.declineTint, label: "Declining" },
};

const LABEL_COL = 112;
const RIGHT_COL = 72;

const s = StyleSheet.create({
  page: {
    paddingTop: 58,
    paddingHorizontal: 36,
    paddingBottom: 88,
    fontFamily: "Helvetica",
    color: C.inkBody,
    fontSize: 9.5,
    lineHeight: 1.4,
    backgroundColor: C.soft2,
  },

  blobTL: {
    position: "absolute",
    top: -70,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: C.coralTint,
  },
  blobTR: {
    position: "absolute",
    top: -50,
    right: -80,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: C.indigoSoft,
  },
  blobBR: {
    position: "absolute",
    bottom: 60,
    right: -100,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: C.coralTint2,
    opacity: 0.5,
  },
  sideStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 5,
    backgroundColor: C.coral,
  },
  sideStripeAccent: {
    position: "absolute",
    top: 0,
    left: 5,
    width: 3,
    height: 96,
    backgroundColor: C.indigo,
  },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    backgroundColor: C.paper,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  headerMark: { width: 20, height: 20 },
  headerTitle: { fontFamily: "Henk", fontWeight: 700, fontSize: 10, color: C.ink },
  headerBy: {
    fontSize: 6.5,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: C.inkSoft,
    marginTop: 1,
  },
  headerLogo: { height: 12, width: 76 },
  headerMeta: { fontSize: 7, color: C.inkSoft, marginTop: 1 },

  card: {
    backgroundColor: C.paper,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  heroAccent: {
    height: 3,
    borderRadius: 2,
    backgroundColor: C.coral,
    width: 48,
    marginBottom: 8,
  },
  kicker: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    letterSpacing: 1.6,
    color: C.coral,
    textTransform: "uppercase",
  },
  h1: {
    fontFamily: "Henk",
    fontWeight: 700,
    fontSize: 16,
    color: C.ink,
    marginTop: 4,
    lineHeight: 1.2,
  },
  heroRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 10 },
  bigNum: { fontFamily: "Henk", fontWeight: 700, fontSize: 42, color: C.indigo, lineHeight: 1 },
  bigUnit: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: C.inkSoft,
    marginLeft: 5,
    marginBottom: 6,
  },
  pill: {
    marginLeft: 12,
    marginBottom: 8,
    backgroundColor: C.coralTint,
    color: C.coralInk,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.coralTint2,
  },
  verdictLine: {
    marginTop: 8,
    fontFamily: "Henk",
    fontWeight: 700,
    fontSize: 11,
    color: C.ink,
  },
  reasoning: { marginTop: 3, fontSize: 8.5, color: C.inkSoft, lineHeight: 1.45 },

  statsRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  stat: { flex: 1, borderRadius: 10, paddingVertical: 7, alignItems: "center" },
  statNum: { fontFamily: "Henk", fontWeight: 700, fontSize: 15 },
  statLabel: {
    fontSize: 6.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: C.inkSoft,
    marginTop: 1,
  },

  sectionGap: { marginTop: 12 },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  h2: { fontFamily: "Henk", fontWeight: 700, fontSize: 12, color: C.ink },
  h2Sub: { fontSize: 7.5, color: C.inkSoft, marginTop: 1 },
  legend: { flexDirection: "row", gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 7, color: C.inkSoft },

  axisRow: { flexDirection: "row", marginBottom: 4 },
  axisTrack: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  axisYear: { fontSize: 6, color: C.inkFaint },

  tRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  tLabelCol: { width: LABEL_COL, paddingRight: 6, alignItems: "flex-end" },
  tName: { fontFamily: "Helvetica-Bold", fontSize: 8, color: C.ink, textAlign: "right" },
  tCat: { fontSize: 6, color: C.inkFaint, textAlign: "right" },
  tTrack: { flex: 1, height: 10, position: "relative", justifyContent: "center" },
  tBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 3,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.soft,
  },
  tBar: { position: "absolute", left: 0, top: 3, height: 6, borderRadius: 3 },
  tNowDot: {
    position: "absolute",
    left: 0,
    top: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.ink,
  },
  tRightCol: {
    width: RIGHT_COL,
    paddingLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tYear: { fontSize: 7.5, color: C.inkSoft },
  tFlag: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: C.decline },
  tFlagDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.decline },

  pivotBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 8,
    backgroundColor: C.coralTint,
    borderRadius: 10,
    padding: 8,
  },
  pivotItem: { flexDirection: "row", gap: 6 },
  pivotDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.decline,
    marginTop: 2,
  },
  pivotTitle: { fontSize: 8.5, color: C.ink },
  pivotWhy: { fontSize: 7, color: C.inkSoft, marginTop: 1, lineHeight: 1.35 },
  affirm: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: C.grow,
  },

  skillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillCard: {
    width: "48.7%",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    padding: 6,
    backgroundColor: C.paper,
  },
  skillTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 1,
  },
  skillName: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: C.ink, maxWidth: 140 },
  chip: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 999,
  },
  skillMeta: { fontSize: 6, color: C.inkSoft, marginBottom: 1 },
  skillLine: { fontSize: 7, color: C.inkBody, lineHeight: 1.3 },

  moveCard: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 4,
    backgroundColor: C.soft,
    borderRadius: 8,
    padding: 6,
  },
  moveNum: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.indigo,
    color: C.paper,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textAlign: "center",
    paddingTop: 2.5,
  },
  moveTitle: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: C.ink },
  moveBody: { fontSize: 7, color: C.inkSoft, marginTop: 1, lineHeight: 1.3 },

  teaserGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  teaser: {
    width: "48.8%",
    borderRadius: 8,
    padding: 7,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.paper,
  },
  teaserLead: { borderColor: C.indigo, backgroundColor: C.indigoSoft },
  teaserLeadBar: {
    height: 2,
    borderRadius: 2,
    backgroundColor: C.coral,
    marginBottom: 4,
    width: 24,
  },
  teaserBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.coralTint,
    color: C.coralInk,
    fontFamily: "Helvetica-Bold",
    fontSize: 5.5,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 999,
    marginBottom: 3,
  },
  teaserHeadline: {
    fontFamily: "Henk",
    fontWeight: 700,
    fontSize: 8,
    color: C.ink,
    lineHeight: 1.2,
  },
  teaserBody: { fontSize: 6, color: C.inkSoft, marginTop: 2, lineHeight: 1.3 },
  teaserCta: {
    marginTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: C.coral,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 36,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.dark,
  },
  footBrand: { flexDirection: "row", alignItems: "center", gap: 7, maxWidth: 340 },
  footMark: { width: 18, height: 18 },
  footLogo: { height: 11, width: 70 },
  footClaim: { fontSize: 6.5, color: "#c8ccd6", marginTop: 2, maxWidth: 270, lineHeight: 1.3 },
  footQrWrap: { flexDirection: "row", alignItems: "center", gap: 7 },
  footQr: { width: 38, height: 38, borderRadius: 3 },
  footScan: { fontFamily: "Helvetica-Bold", fontSize: 7, color: C.paper, textAlign: "right" },
  footUrl: { fontSize: 6.5, color: C.coral, textAlign: "right", marginTop: 1 },
});

function Chip({ trend }: { trend: Trend }) {
  const t = TREND[trend];
  return (
    <Text style={[s.chip, { backgroundColor: t.tint, color: t.color }]}>{t.label}</Text>
  );
}

function PageChrome({
  pageLabel,
  markDataUrl,
  logoDataUrl,
}: {
  pageLabel: string;
  markDataUrl: string;
  logoDataUrl: string;
}) {
  return (
    <>
      <View style={s.blobTL} fixed />
      <View style={s.blobTR} fixed />
      <View style={s.blobBR} fixed />
      <View style={s.sideStripe} fixed />
      <View style={s.sideStripeAccent} fixed />
      <View style={s.header} fixed>
        <View style={s.headerLeft}>
          {markDataUrl ? <Image style={s.headerMark} src={markDataUrl} /> : null}
          <View>
            <Text style={s.headerTitle}>Skill Half-Life</Text>
            <Text style={s.headerBy}>by Kickresume</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          {logoDataUrl ? <Image style={s.headerLogo} src={logoDataUrl} /> : null}
          <Text style={s.headerMeta}>{pageLabel}</Text>
        </View>
      </View>
    </>
  );
}

function Footer({
  qrDataUrl,
  siteHost,
  markDataUrl,
  logoDataUrl,
}: {
  qrDataUrl: string;
  siteHost: string;
  markDataUrl: string;
  logoDataUrl: string;
}) {
  return (
    <View style={s.footer} fixed>
      <View style={s.footBrand}>
        {markDataUrl ? <Image style={s.footMark} src={markDataUrl} /> : null}
        <View>
          {logoDataUrl ? (
            <Image style={s.footLogo} src={logoDataUrl} />
          ) : (
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10, color: C.paper }}>
              Kickresume
            </Text>
          )}
          <Text style={s.footClaim}>
            Kickresume helps 5M+ people build standout resumes, cover letters and future-proof
            career plans with AI.
          </Text>
        </View>
      </View>
      <View style={s.footQrWrap}>
        <View>
          <Text style={s.footScan}>Scan to calculate yours</Text>
          <Text style={s.footUrl}>{siteHost}</Text>
        </View>
        {qrDataUrl ? <Image style={s.footQr} src={qrDataUrl} /> : null}
      </View>
    </View>
  );
}

export default function PlanDocument({ verdict, plan, qrDataUrl, siteHost }: Props) {
  const years = verdict.headlineHalfLife.toFixed(1);
  const reasoning = overallReasoning(verdict);
  const moves = nextMoves(verdict, plan);
  const teasers = orderedTeasers(verdict);
  const axisYears = Array.from({ length: plan.span + 1 }, (_, i) => plan.startYear + i);

  const markDataUrl = brandPngDataUrl("hourglass-mark.png");
  const logoDataUrl = brandPngDataUrl("kickresume-logo.png");
  const logoWhiteDataUrl = brandPngDataUrl("kickresume-logo-white.png");

  const stats = [
    { label: "Growing", value: verdict.growingCount, color: C.grow, tint: C.growTint },
    { label: "Stable", value: verdict.stableCount, color: C.stable, tint: C.stableTint },
    { label: "Declining", value: verdict.decliningCount, color: C.decline, tint: C.declineTint },
  ];

  const chrome = {
    markDataUrl,
    logoDataUrl,
  };
  const foot = {
    qrDataUrl,
    siteHost,
    markDataUrl,
    logoDataUrl: logoWhiteDataUrl,
  };

  return (
    <Document
      title={`Your 2030-Proof Skill Plan — ${years} years`}
      author="Skill Half-Life Calculator by Kickresume"
    >
      <Page size="A4" style={s.page}>
        <PageChrome pageLabel="2030-proof skill plan" {...chrome} />
        <Footer {...foot} />

        <View style={s.card}>
          <View style={s.heroAccent} />
          <Text style={s.kicker}>Your 2030-proof skill plan</Text>
          <Text style={s.h1}>Here&apos;s when your skills expire — and how to stay ahead.</Text>

          <View style={s.heroRow}>
            <Text style={s.bigNum}>{years}</Text>
            <Text style={s.bigUnit}>years</Text>
            <Text style={s.pill}>Best before {verdict.headlineExpiryYear}</Text>
          </View>

          <Text style={s.verdictLine}>{verdictHeadline(verdict.headlineHalfLife)}</Text>
          <Text style={s.reasoning}>{reasoning}</Text>

          <View style={s.statsRow}>
            {stats.map((st) => (
              <View key={st.label} style={[s.stat, { backgroundColor: st.tint }]}>
                <Text style={[s.statNum, { color: st.color }]}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.card, s.sectionGap]} wrap={false}>
          <View style={s.sectionHead}>
            <View>
              <Text style={s.h2}>
                {plan.startYear}–{plan.endYear} skill timeline
              </Text>
              <Text style={s.h2Sub}>Best-before year per skill · colored by trend</Text>
            </View>
            <View style={s.legend}>
              {(["growing", "stable", "declining"] as Trend[]).map((t) => (
                <View key={t} style={s.legendItem}>
                  <View style={[s.dot, { backgroundColor: TREND[t].color }]} />
                  <Text style={s.legendText}>{TREND[t].label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={s.axisRow}>
            <View style={{ width: LABEL_COL }} />
            <View style={s.axisTrack}>
              {axisYears.map((yr, i) => (
                <Text key={yr} style={s.axisYear}>
                  {i === 0 ? "now" : yr}
                </Text>
              ))}
            </View>
            <View style={{ width: RIGHT_COL }} />
          </View>

          {plan.rows.map((r, i) => {
            const t = TREND[r.trend];
            const pct = Math.max(4, Math.min(100, (r.expiryPoint / plan.span) * 100));
            return (
              <View key={`${r.input}-${i}`} style={s.tRow}>
                <View style={s.tLabelCol}>
                  <Text style={s.tName}>{r.input}</Text>
                  <Text style={s.tCat}>{r.category}</Text>
                </View>
                <View style={s.tTrack}>
                  <View style={s.tBg} />
                  <View style={[s.tBar, { width: `${pct}%`, backgroundColor: t.color }]} />
                  <View style={s.tNowDot} />
                </View>
                <View style={s.tRightCol}>
                  {r.flagged ? (
                    <>
                      <View style={s.tFlagDot} />
                      <Text style={s.tFlag}>{r.expiryYear}</Text>
                    </>
                  ) : (
                    <Text style={s.tYear}>{r.expiryYear}</Text>
                  )}
                </View>
              </View>
            );
          })}

          {plan.flaggedCount > 0 ? (
            <View style={s.pivotBox}>
              <Text style={[s.h2, { fontSize: 10, marginBottom: 5 }]}>Where to pivot</Text>
              {plan.rows
                .filter((r) => r.flagged && r.pivot)
                .map((r, i) => (
                  <View key={`${r.input}-${i}`} style={s.pivotItem}>
                    <View style={s.pivotDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.pivotTitle}>
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>{r.input}</Text> (best
                        before {r.expiryYear}) {"\u2014"} pivot to{" "}
                        <Text style={{ fontFamily: "Helvetica-Bold" }}>{r.pivot!.skill_name}</Text>
                      </Text>
                      <Text style={s.pivotWhy}>
                        {r.pivot!.notes} — {r.pivot!.source}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={[s.affirm, { marginTop: 8 }]}>{plan.affirmation}</Text>
          )}
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <PageChrome pageLabel="2030-proof skill plan" {...chrome} />
        <Footer {...foot} />

        <View style={s.card}>
          <Text style={[s.h2, { marginBottom: 8 }]}>The reasoning, skill by skill</Text>
          <View style={s.skillGrid}>
            {verdict.skills.map((sk, i) => (
              <View key={`${sk.input}-${i}`} style={s.skillCard} wrap={false}>
                <View style={s.skillTop}>
                  <Text style={s.skillName}>{sk.input}</Text>
                  <Chip trend={sk.trend} />
                </View>
                <Text style={s.skillMeta}>
                  {sk.category} · ~{sk.half_life_years} yr · best before{" "}
                  {Math.round(verdict.baselineYear + sk.half_life_years)}
                </Text>
                <Text style={s.skillLine}>{sk.one_liner}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[s.card, s.sectionGap]}>
          <Text style={s.h2}>Your next moves</Text>
          <Text style={[s.h2Sub, { marginBottom: 5 }]}>
            Prioritized actions from your own skill mix
          </Text>
          {moves.map((m, i) => (
            <View key={m.title} style={s.moveCard} wrap={false}>
              <Text style={s.moveNum}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.moveTitle}>{m.title.replace(/^\d+\.\s*/, "")}</Text>
                <Text style={s.moveBody}>{m.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[s.card, s.sectionGap]}>
          <Text style={s.h2}>What&apos;s next</Text>
          <Text style={s.h2Sub}>
            Based on your result — reordered to lead with what fits you best.
          </Text>
          <View style={s.teaserGrid}>
            {teasers.map((t, i) => {
              const lead = i === 0;
              const shortBody =
                t.body.length > 110 ? `${t.body.slice(0, 107).trimEnd()}…` : t.body;
              return (
                <View key={t.id} style={[s.teaser, lead ? s.teaserLead : {}]} wrap={false}>
                  {lead ? <View style={s.teaserLeadBar} /> : null}
                  {lead ? <Text style={s.teaserBadge}>Best next step for you</Text> : null}
                  <Text style={s.teaserHeadline}>{t.headline}</Text>
                  <Text style={s.teaserBody}>{shortBody}</Text>
                  <Link src={t.href} style={s.teaserCta}>
                    {t.cta} →
                  </Link>
                </View>
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
}
