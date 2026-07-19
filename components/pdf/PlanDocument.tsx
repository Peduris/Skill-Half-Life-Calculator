import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Verdict, Trend } from "@/lib/types";
import type { SkillPlan } from "@/lib/plan";
import { verdictHeadline, overallReasoning, nextMoves } from "@/lib/report";

interface Props {
  verdict: Verdict;
  plan: SkillPlan;
  qrDataUrl: string;
  siteHost: string;
}

const C = {
  ink: "#081430",
  inkSoft: "#6b7280",
  inkFaint: "#9aa2b1",
  line: "#e6e8ee",
  paper: "#ffffff",
  soft: "#f4f7f8",
  indigo: "#514eea",
  violet: "#8b5cf6",
  coral: "#ff5e59",
  coralTint: "#fff4f3",
  coralInk: "#cd2927",
  grow: "#056640",
  growTint: "#ecfef4",
  stable: "#b26a00",
  stableTint: "#fff2dc",
  decline: "#e80029",
  declineTint: "#fbe9e6",
};

const TREND: Record<Trend, { color: string; tint: string; label: string }> = {
  growing: { color: C.grow, tint: C.growTint, label: "Growing" },
  stable: { color: C.stable, tint: C.stableTint, label: "Stable" },
  declining: { color: C.decline, tint: C.declineTint, label: "Declining" },
};

const LABEL_COL = 122;
const RIGHT_COL = 92;

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingHorizontal: 44,
    paddingBottom: 96,
    fontFamily: "Helvetica",
    color: C.ink,
    fontSize: 10,
    lineHeight: 1.5,
  },
  accentBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.indigo,
    marginBottom: 22,
    width: 120,
  },
  kicker: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    letterSpacing: 2,
    color: C.inkSoft,
    textTransform: "uppercase",
  },
  h1: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: C.ink,
    marginTop: 8,
    lineHeight: 1.15,
  },
  heroRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 14 },
  bigNum: { fontFamily: "Helvetica-Bold", fontSize: 58, color: C.indigo, lineHeight: 1 },
  bigUnit: { fontFamily: "Helvetica-Bold", fontSize: 20, color: C.inkSoft, marginLeft: 6, marginBottom: 6 },
  pill: {
    marginLeft: 16,
    marginBottom: 10,
    backgroundColor: C.coralTint,
    color: C.coralInk,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  verdictLine: { marginTop: 12, fontFamily: "Helvetica-Bold", fontSize: 12, color: C.ink },
  reasoning: { marginTop: 6, fontSize: 10, color: C.inkSoft },

  statsRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  stat: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  statNum: { fontFamily: "Helvetica-Bold", fontSize: 18 },
  statLabel: { fontSize: 7, letterSpacing: 1, textTransform: "uppercase", color: C.inkSoft, marginTop: 2 },

  section: { marginTop: 26 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 14, color: C.ink },
  legend: { flexDirection: "row", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 8, color: C.inkSoft },

  axisRow: { flexDirection: "row", marginBottom: 6 },
  axisTrack: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  axisYear: { fontSize: 6.5, color: C.inkFaint },

  tRow: { flexDirection: "row", alignItems: "center", marginBottom: 9 },
  tLabelCol: { width: LABEL_COL, paddingRight: 8, alignItems: "flex-end" },
  tName: { fontFamily: "Helvetica-Bold", fontSize: 9, color: C.ink, textAlign: "right" },
  tCat: { fontSize: 6.5, color: C.inkFaint, textAlign: "right" },
  tTrack: { flex: 1, height: 12, position: "relative", justifyContent: "center" },
  tBg: { position: "absolute", left: 0, right: 0, top: 4, height: 7, borderRadius: 4, backgroundColor: C.soft },
  tBar: { position: "absolute", left: 0, top: 4, height: 7, borderRadius: 4 },
  tNowDot: { position: "absolute", left: 0, top: 2.5, width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },
  tRightCol: { width: RIGHT_COL, paddingLeft: 10, flexDirection: "row", alignItems: "center", gap: 5 },
  tYear: { fontSize: 8, color: C.inkSoft },
  tFlag: { fontFamily: "Helvetica-Bold", fontSize: 8, color: C.decline },
  tFlagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.decline },

  pivotBox: { marginTop: 14, borderTopWidth: 1, borderColor: C.line, paddingTop: 12 },
  pivotItem: { flexDirection: "row", gap: 8, marginBottom: 8 },
  pivotDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.decline, marginTop: 3 },
  pivotTitle: { fontSize: 9.5, color: C.ink },
  pivotWhy: { fontSize: 8, color: C.inkSoft, marginTop: 1 },
  affirm: { textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 10, color: C.grow, marginTop: 6 },

  skillCard: {
    borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 10, marginBottom: 8,
  },
  skillTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  skillName: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.ink },
  chip: { fontFamily: "Helvetica-Bold", fontSize: 7, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 999 },
  skillMeta: { fontSize: 8, color: C.inkSoft, marginBottom: 3 },
  skillLine: { fontSize: 9, color: C.ink },

  move: { marginBottom: 10 },
  moveTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: C.ink },
  moveBody: { fontSize: 9, color: C.inkSoft, marginTop: 1 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 44,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.paper,
  },
  footBrand: { flexDirection: "row", alignItems: "center", gap: 8, maxWidth: 360 },
  footMark: { width: 22, height: 22, borderRadius: 6, backgroundColor: C.coral },
  footName: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.ink },
  footClaim: { fontSize: 7.5, color: C.inkSoft, marginTop: 1, maxWidth: 300 },
  footQrWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  footQr: { width: 46, height: 46 },
  footScan: { fontFamily: "Helvetica-Bold", fontSize: 8, color: C.ink, textAlign: "right" },
  footUrl: { fontSize: 7.5, color: C.indigo, textAlign: "right", marginTop: 1 },
});

function Chip({ trend }: { trend: Trend }) {
  const t = TREND[trend];
  return (
    <Text style={[s.chip, { backgroundColor: t.tint, color: t.color }]}>{t.label}</Text>
  );
}

export default function PlanDocument({ verdict, plan, qrDataUrl, siteHost }: Props) {
  const years = verdict.headlineHalfLife.toFixed(1);
  const reasoning = overallReasoning(verdict);
  const moves = nextMoves(verdict, plan);
  const years2 = plan.span; // axis span
  const axisYears = Array.from({ length: years2 + 1 }, (_, i) => plan.startYear + i);

  const stats = [
    { label: "Growing", value: verdict.growingCount, color: C.grow, tint: C.growTint },
    { label: "Stable", value: verdict.stableCount, color: C.stable, tint: C.stableTint },
    { label: "Declining", value: verdict.decliningCount, color: C.decline, tint: C.declineTint },
  ];

  const Footer = (
    <View style={s.footer} fixed>
      <View style={s.footBrand}>
        <View style={s.footMark} />
        <View>
          <Text style={s.footName}>Kickresume</Text>
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

  return (
    <Document
      title={`Your 2030-Proof Skill Plan — ${years} years`}
      author="Skill Half-Life Calculator by Kickresume"
    >
      <Page size="A4" style={s.page}>
        {Footer}

        {/* Hero + reasoning (no page header, per brief) */}
        <View style={s.accentBar} />
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

        {/* Timeline */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.h2}>
              {plan.startYear}–{plan.endYear} skill timeline
            </Text>
            <View style={s.legend}>
              {(["growing", "stable", "declining"] as Trend[]).map((t) => (
                <View key={t} style={s.legendItem}>
                  <View style={[s.dot, { backgroundColor: TREND[t].color }]} />
                  <Text style={s.legendText}>{TREND[t].label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Year axis */}
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
              <View key={`${r.input}-${i}`} style={s.tRow} wrap={false}>
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

          {/* Pivot plan / affirmation */}
          <View style={s.pivotBox}>
            {plan.flaggedCount > 0 ? (
              <>
                <Text style={[s.h2, { fontSize: 11, marginBottom: 8 }]}>Where to pivot</Text>
                {plan.rows
                  .filter((r) => r.flagged && r.pivot)
                  .map((r, i) => (
                    <View key={`${r.input}-${i}`} style={s.pivotItem} wrap={false}>
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
              </>
            ) : (
              <Text style={s.affirm}>{plan.affirmation}</Text>
            )}
          </View>
        </View>

        {/* Reasoning, skill by skill */}
        <View style={s.section}>
          <Text style={[s.h2, { marginBottom: 12 }]}>The reasoning, skill by skill</Text>
          {verdict.skills.map((sk, i) => (
            <View key={`${sk.input}-${i}`} style={s.skillCard} wrap={false}>
              <View style={s.skillTop}>
                <Text style={s.skillName}>{sk.input}</Text>
                <Chip trend={sk.trend} />
              </View>
              <Text style={s.skillMeta}>
                {sk.category} · ~{sk.half_life_years} yr half-life · best before{" "}
                {Math.round(verdict.baselineYear + sk.half_life_years)}
              </Text>
              <Text style={s.skillLine}>{sk.one_liner}</Text>
            </View>
          ))}
        </View>

        {/* Next moves */}
        <View style={s.section}>
          <Text style={[s.h2, { marginBottom: 12 }]}>Your next moves</Text>
          {moves.map((m) => (
            <View key={m.title} style={s.move} wrap={false}>
              <Text style={s.moveTitle}>{m.title}</Text>
              <Text style={s.moveBody}>{m.body}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
