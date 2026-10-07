import { OfficialExamBlueprint, GenerationRules, ExamLevel } from './examSchema';

const strictRules = (instructions: string[]): GenerationRules => ({
  mustFollowOfficialStructure: true,
  fixedItemCount: true,
  fixedTaskType: true,
  fixedAnswerType: true,
  allowExtraItems: false,
  allowExtraOptions: false,
  requireEvidenceFromSource: true,
  instructions,
});

const buildTestDaFPaperBlueprint = (level: ExamLevel): OfficialExamBlueprint => ({
  blueprintId: `TESTDAF_${level}_PAPER_2026`,
  provider: 'TESTDAF',
  level,
  version: '2026.1',
  paperOrDigital: 'PAPER',
  modules: [
    {
      moduleId: `TESTDAF_${level}_PAPER_LESEN`,
      skill: 'LESEN',
      durationMinutes: 60,
      totalItems: 30,
      totalRawPoints: 30,
      tasks: [
        { teil: 1, unit: 'ITEM', title: 'Zuordnung Studienangebote', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['10 items matching text snippets to student scenarios']) },
        { teil: 2, unit: 'ITEM', title: 'Wissenschaftlicher Text MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 3, rawPoints: 10, content: { topicCategory: 'Wissenschaft', context: 'Artikel', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['10 multiple choice questions with 3 options a/b/c']) },
        { teil: 3, unit: 'ITEM', title: 'Forschungstext R/F/Nicht im Text', taskType: 'TRUE_FALSE_NOT_GIVEN', answerType: 'NOT_GIVEN', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Wissenschaft', context: 'Forschung', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['10 items testing Richtig/Falsch/Text sagt dazu nichts']) }
      ]
    },
    {
      moduleId: `TESTDAF_${level}_PAPER_HOEREN`,
      skill: 'HOEREN',
      durationMinutes: 40,
      totalItems: 25,
      totalRawPoints: 25,
      tasks: [
        { teil: 1, unit: 'ITEM', title: 'Campusdialog Kurzantwort', taskType: 'SHORT_ANSWER', answerType: 'SHORT_TEXT', responseMode: 'INPUT_TEXT', itemCount: 8, rawPoints: 8, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['8 items short answer based on dialogue heard once']) },
        { teil: 2, unit: 'ITEM', title: 'Interview Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['10 items Richtig/Falsch based on academic interview heard once']) },
        { teil: 3, unit: 'ITEM', title: 'Vorlesung Kurzantwort', taskType: 'SHORT_ANSWER', answerType: 'SHORT_TEXT', responseMode: 'INPUT_TEXT', itemCount: 7, rawPoints: 7, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['7 items short answer based on lecture heard twice']) }
      ]
    },
    {
      moduleId: `TESTDAF_${level}_PAPER_SCHREIBEN`,
      skill: 'SCHREIBEN',
      durationMinutes: 60,
      totalItems: 1,
      totalRawPoints: 20,
      tasks: [
        { teil: 1, unit: 'TASK', title: 'Grafikbeschreibung und Argumentation', taskType: 'GRAPH_DESCRIPTION_AND_ARGUMENTATION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Akademisch', context: 'Studium', textGenre: 'ESSAY', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Describe graphic data accurately', 'Argue pros and cons and state position', 'Approx 200 words']) }
      ]
    },
    {
      moduleId: `TESTDAF_${level}_PAPER_SPRECHEN`,
      skill: 'SPRECHEN',
      durationMinutes: 35,
      totalItems: 7,
      totalRawPoints: 35,
      tasks: [
        { teil: 1, unit: 'TASK', title: 'Aufgabe 1: Auskunft einholen', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Uni-Situation', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Roleplay info gathering at university']) },
        { teil: 2, unit: 'TASK', title: 'Aufgabe 2: Von Heimatland berichten', taskType: 'ARGUMENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Campus', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Describe personal experience/opinion from home country']) },
        { teil: 3, unit: 'TASK', title: 'Aufgabe 3: Grafik beschreiben', taskType: 'GRAPH_DESCRIPTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Seminar', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Describe graphic data orally']) },
        { teil: 4, unit: 'TASK', title: 'Aufgabe 4: Stellungnahme und Argumentation', taskType: 'ARGUMENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Seminar', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Argue pros and cons of a controversial academic topic']) },
        { teil: 5, unit: 'TASK', title: 'Aufgabe 5: Beratung und Abwägung', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Campus', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Advise a fellow student on study options']) },
        { teil: 6, unit: 'TASK', title: 'Aufgabe 6: Hypothesen und Dateninterpretation', taskType: 'DATA_INTERPRETATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Seminar', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Analyze reasons and form hypotheses based on graphic data']) },
        { teil: 7, unit: 'TASK', title: 'Aufgabe 7: Ratschlag formulieren', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Campus', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Give advice or state opinion briefly in a student setting']) }
      ]
    }
  ]
});

const buildTestDaFDigitalBlueprint = (level: ExamLevel): OfficialExamBlueprint => ({
  blueprintId: `TESTDAF_${level}_DIGITAL_2026`,
  provider: 'TESTDAF',
  level,
  version: '2026.1',
  paperOrDigital: 'DIGITAL',
  modules: [
    {
      moduleId: `TESTDAF_${level}_DIGITAL_LESEN`,
      skill: 'LESEN',
      durationMinutes: 60,
      totalItems: 34,
      totalRawPoints: 34,
      tasks: [
        { teil: 1, unit: 'ITEM', title: 'Digital Lesen 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'DRAG_DROP', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['Match 5 items on digital interface']) },
        { teil: 2, unit: 'ITEM', title: 'Digital Lesen 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Forschung', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['5 multiple choice questions']) },
        { teil: 3, unit: 'ITEM', title: 'Digital Lesen 3', taskType: 'CLOZE', answerType: 'CLOZE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Magazin', textGenre: 'BERICHT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['Cloze text for academic vocabulary']) },
        { teil: 4, unit: 'ITEM', title: 'Digital Lesen 4', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Magazin', textGenre: 'BERICHT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['5 reading comprehension items']) },
        { teil: 5, unit: 'ITEM', title: 'Digital Lesen 5', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Magazin', textGenre: 'BERICHT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['5 matching items']) },
        { teil: 6, unit: 'ITEM', title: 'Digital Lesen 6', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Magazin', textGenre: 'BERICHT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['5 reading comprehension items']) },
        { teil: 7, unit: 'ITEM', title: 'Digital Lesen 7', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 4, optionsCount: 3, rawPoints: 4, content: { topicCategory: 'Wissenschaft', context: 'Magazin', textGenre: 'BERICHT', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['4 final reading items']) }
      ]
    },
    {
      moduleId: `TESTDAF_${level}_DIGITAL_HOEREN`,
      skill: 'HOEREN',
      durationMinutes: 40,
      totalItems: 30,
      totalRawPoints: 30,
      tasks: [
        { teil: 1, unit: 'ITEM', title: 'Digital Hören 1', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 4, rawPoints: 4, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['4 audio items']) },
        { teil: 2, unit: 'ITEM', title: 'Digital Hören 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 4, optionsCount: 3, rawPoints: 4, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['4 audio items']) },
        { teil: 3, unit: 'ITEM', title: 'Digital Hören 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 4, rawPoints: 4, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['4 audio items']) },
        { teil: 4, unit: 'ITEM', title: 'Digital Hören 4', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 4, optionsCount: 3, rawPoints: 4, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['4 audio items']) },
        { teil: 5, unit: 'ITEM', title: 'Digital Hören 5', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['5 audio items']) },
        { teil: 6, unit: 'ITEM', title: 'Digital Hören 6', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['5 audio items']) },
        { teil: 7, unit: 'ITEM', title: 'Digital Hören 7', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 4, optionsCount: 3, rawPoints: 4, content: { topicCategory: 'Studium', context: 'Uni', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'objective', humanEvaluation: false }, generationRules: strictRules(['4 audio items']) }
      ]
    },
    {
      moduleId: `TESTDAF_${level}_DIGITAL_SCHREIBEN`,
      skill: 'SCHREIBEN',
      durationMinutes: 60,
      totalItems: 2,
      totalRawPoints: 40,
      tasks: [
        { teil: 1, unit: 'TASK', title: 'Aufgabe 1: Synthese und Grafik', taskType: 'GRAPH_DESCRIPTION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Akademisch', context: 'Studium', textGenre: 'ESSAY', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Synthesize academic reading and graph data']) },
        { teil: 2, unit: 'TASK', title: 'Aufgabe 2: Argumentation', taskType: 'ARGUMENTATION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Akademisch', context: 'Studium', textGenre: 'ESSAY', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal argumentation based on academic prompt']) }
      ]
    },
    {
      moduleId: `TESTDAF_${level}_DIGITAL_SPRECHEN`,
      skill: 'SPRECHEN',
      durationMinutes: 35,
      totalItems: 7,
      totalRawPoints: 35,
      tasks: [
        { teil: 1, unit: 'TASK', title: 'Digital Sprechen 1', taskType: 'SHORT_ANSWER', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Universitätsalltag', context: 'Auskunft', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 1']) },
        { teil: 2, unit: 'TASK', title: 'Digital Sprechen 2', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Uni', context: 'Auskunft', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 2']) },
        { teil: 3, unit: 'TASK', title: 'Digital Sprechen 3', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Uni', context: 'Auskunft', textGenre: 'DIALOG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 3']) },
        { teil: 4, unit: 'TASK', title: 'Digital Sprechen 4', taskType: 'ARGUMENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Stellungnahme', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 4']) },
        { teil: 5, unit: 'TASK', title: 'Digital Sprechen 5', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Stellungnahme', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 5']) },
        { teil: 6, unit: 'TASK', title: 'Digital Sprechen 6', taskType: 'DATA_INTERPRETATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Grafik', context: 'Daten beschreiben', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 6']) },
        { teil: 7, unit: 'TASK', title: 'Digital Sprechen 7', taskType: 'ARGUMENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Stellungnahme', textGenre: 'VORTRAG', cefrLevel: level }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Computer-based university task 7']) }
      ]
    }
  ]
});

export const OFFICIAL_EXAM_BLUEPRINTS: Record<string, OfficialExamBlueprint> = {

  'GOETHE_A1_2026': {
    blueprintId: 'GOETHE_A1_2026', provider: 'GOETHE', level: 'A1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'GOETHE_A1_LESEN', skill: 'LESEN', durationMinutes: 25, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Kurze Nachrichten', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Notizen', textGenre: 'EMAIL', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['2 very short messages', '5 Richtig/Falsch questions']) },
          { teil: 2, unit: 'ITEM', title: 'Informationstexte', taskType: 'SINGLE_CHOICE', answerType: 'SINGLE_CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Internet', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Short public texts or ads', 'Options: a or b']) },
          { teil: 3, unit: 'ITEM', title: 'Schilder und Aushänge', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Öffentlichkeit', context: 'Schilder', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Public signs/notices', 'Richtig/Falsch']) }
        ]
      },
      {
        moduleId: 'GOETHE_A1_HOEREN', skill: 'HOEREN', durationMinutes: 20, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Kurze Alltagsgespräche', taskType: 'SINGLE_CHOICE', answerType: 'SINGLE_CHOICE', responseMode: 'SELECT', itemCount: 6, audioReplay: 2, rawPoints: 6, content: { topicCategory: 'Alltag', context: 'Gespräche', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Hear twice', 'Multiple choice A/B/C']) },
          { teil: 2, unit: 'ITEM', title: 'Durchsagen', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 4, audioReplay: 1, rawPoints: 4, content: { topicCategory: 'Alltag', context: 'Ansagen', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Hear once', 'Richtig/Falsch']) },
          { teil: 3, unit: 'ITEM', title: 'Nachrichten am Telefon', taskType: 'SINGLE_CHOICE', answerType: 'SINGLE_CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Telefon', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Hear twice', 'Multiple choice A/B/C']) }
        ]
      },
      {
        moduleId: 'GOETHE_A1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 20, totalItems: 2, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Formular ausfüllen', taskType: 'FORM_FILLING', answerType: 'SHORT_TEXT', responseMode: 'INPUT_TEXT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Persönliches', context: 'Formular', textGenre: 'BERICHT', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Fill 5 blanks in a form based on source text']) },
          { teil: 2, unit: 'TASK', title: 'Kurze Mitteilung schreiben', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Privat', textGenre: 'EMAIL', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write a 30-word personal email', 'Cover 3 Leitpunkte']) }
        ]
      },
      {
        moduleId: 'GOETHE_A1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Sich vorstellen', taskType: 'SELF_INTRODUCTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Kennenlernen', context: 'Vorstellung', textGenre: 'VORTRAG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Sich vorstellen nach Leitpunkten']) },
          { teil: 2, unit: 'TASK', title: 'Informationen erfragen', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Wortkarten', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Um Informationen bitten und verstehen']) },
          { teil: 3, unit: 'TASK', title: 'Bitten formulieren', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Bitten', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Bitten formulieren und darauf reagieren']) }
        ]
      }
    ]
  },

  'GOETHE_A2_2026': {
    blueprintId: 'GOETHE_A2_2026', provider: 'GOETHE', level: 'A2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'GOETHE_A2_LESEN', skill: 'LESEN', durationMinutes: 30, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Zeitungstext MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Zeitung', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Newspaper article', 'a/b/c choices']) },
          { teil: 2, unit: 'ITEM', title: 'Info-Tafel Zuordnung', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Info-Tafel', textGenre: 'ANZEIGE', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match situations to info boards']) },
          { teil: 3, unit: 'ITEM', title: 'E-Mail MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Privat', context: 'E-Mail', textGenre: 'EMAIL', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Read an email, answer a/b/c']) },
          { teil: 4, unit: 'ITEM', title: 'Anzeigen Ja/Nein', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Anzeigen', textGenre: 'ANZEIGE', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Classified ads with option X if none matches']) }
        ]
      },
      {
        moduleId: 'GOETHE_A2_HOEREN', skill: 'HOEREN', durationMinutes: 30, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: '5 kurze Texte', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Gespräche', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 short texts heard twice']) },
          { teil: 2, unit: 'ITEM', title: 'Zuordnung Bilder', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['1 conversation heard once', 'Match images']) },
          { teil: 3, unit: 'ITEM', title: '5 Alltagsgespräche', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Gespräche', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 short conversations heard once']) },
          { teil: 4, unit: 'ITEM', title: 'Interview Ja/Nein', taskType: 'YES_NO', answerType: 'YES_NO', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Interview', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Interview heard twice', 'Ja/Nein']) }
        ]
      },
      {
        moduleId: 'GOETHE_A2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 30, totalItems: 2, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Kurze Nachricht', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Privat', context: 'Nachricht', textGenre: 'EMAIL', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Short SMS/Email 20-30 words with 3 points']) },
          { teil: 2, unit: 'TASK', title: 'Formelle Nachricht', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Beruf', context: 'Formell', textGenre: 'EMAIL', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal email 30-40 words with 3 points']) }
        ]
      },
      {
        moduleId: 'GOETHE_A2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Fragen zur Person', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 6, content: { topicCategory: 'Persönliches', context: 'Fragen', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Ask and answer personal questions']) },
          { teil: 2, unit: 'TASK', title: 'Aus dem eigenen Leben', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 7, content: { topicCategory: 'Alltag', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Report about own life based on prompt']) },
          { teil: 3, unit: 'TASK', title: 'Gemeinsam planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 7, content: { topicCategory: 'Alltag', context: 'Planung', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Negotiate a plan together']) }
        ]
      }
    ]
  },

  'GOETHE_B1_2026': {
    blueprintId: 'GOETHE_B1_2026', provider: 'GOETHE', level: 'B1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'GOETHE_B1_LESEN', skill: 'LESEN', durationMinutes: 65, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Blog', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 6, textCount: 1, rawPoints: 6, content: { topicCategory: 'Alltag', context: 'Blog', textGenre: 'BLOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['One continuous text', '6 statements', 'Richtig / Falsch']) },
          { teil: 2, unit: 'ITEM', title: 'Presseartikel', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, textCount: 2, optionsCount: 3, rawPoints: 6, content: { topicCategory: 'Presse', context: 'Artikel', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Two press texts', '6 questions', '3 options a/b/c']) },
          { teil: 3, unit: 'ITEM', title: 'Anzeigen', taskType: 'ADVERTISEMENT_MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 7, textCount: 10, rawPoints: 7, content: { topicCategory: 'Dienstleistungen', context: 'Anzeigen', textGenre: 'ANZEIGE', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['7 situations', '10 advertisements', 'One situation has no matching ad']) },
          { teil: 4, unit: 'ITEM', title: 'Meinungen', taskType: 'YES_NO', answerType: 'YES_NO', responseMode: 'SELECT', itemCount: 7, textCount: 7, rawPoints: 7, content: { topicCategory: 'Diskussion', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['7 opinions/comments', 'Determine position Ja / Nein']) },
          { teil: 5, unit: 'ITEM', title: 'Hausordnung / Regeln', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 4, textCount: 1, optionsCount: 3, rawPoints: 4, content: { topicCategory: 'Hausordnung', context: 'Regeln', textGenre: 'HAUSORDNUNG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Formal rules/instructions', '4 questions', '3 options a/b/c']) }
        ]
      },
      {
        moduleId: 'GOETHE_B1_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Kurze Texte', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 10, textCount: 5, audioReplay: 2, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Gespräche', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 short texts', '2 questions per text', 'Hear twice']) },
          { teil: 2, unit: 'ITEM', title: 'Längerer Hörtext', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, textCount: 1, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Information', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['1 long text', 'Hear once', 'a/b/c']) },
          { teil: 3, unit: 'ITEM', title: 'Gespräch / Diskussion', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, textCount: 1, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Gesellschaft', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Discussion between speakers', 'Hear once', 'Richtig/Falsch']) },
          { teil: 4, unit: 'ITEM', title: 'Längerer Hörtext', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, textCount: 1, audioReplay: 2, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Radio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['1 long text', 'Hear twice']) }
        ]
      },
      {
        moduleId: 'GOETHE_B1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 60, totalItems: 3, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Persönliche E-Mail', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 33, content: { topicCategory: 'Freundschaft', context: 'Privat', textGenre: 'EMAIL', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Personal email (approx 80 words)', 'Must cover exactly 3 Leitpunkte']) },
          { teil: 2, unit: 'TASK', title: 'Forumsbeitrag', taskType: 'FORUM_POST', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 33, content: { topicCategory: 'Meinung', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Forum post expressing an opinion (approx 80 words)']) },
          { teil: 3, unit: 'TASK', title: 'Formelle E-Mail', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 34, content: { topicCategory: 'Beruf', context: 'Formell', textGenre: 'EMAIL', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal email e.g. apology (approx 40 words)']) }
        ]
      },
      {
        moduleId: 'GOETHE_B1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Gemeinsam planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 28, content: { topicCategory: 'Alltag', context: 'Planung', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Plan something together based on 4 Leitpunkte']) },
          { teil: 2, unit: 'TASK', title: 'Ein Thema präsentieren', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 42, content: { topicCategory: 'Gesellschaft', context: 'Präsentation', textGenre: 'VORTRAG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Present a topic following 5 structural steps']) },
          { teil: 3, unit: 'TASK', title: 'Fragen und Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 30, content: { topicCategory: 'Diskussion', context: 'Feedback', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Ask questions about presentation and react to feedback']) }
        ]
      }
    ]
  },

  'GOETHE_B2_2026': {
    blueprintId: 'GOETHE_B2_2026', provider: 'GOETHE', level: 'B2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'GOETHE_B2_LESEN', skill: 'LESEN', durationMinutes: 65, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Forum Zuordnung', taskType: 'FORUM_MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 9, rawPoints: 9, content: { topicCategory: 'Diskussion', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 9 statements to 4 long forum posts (A-D)']) },
          { teil: 2, unit: 'ITEM', title: 'Artikel MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, optionsCount: 3, rawPoints: 6, content: { topicCategory: 'Presse', context: 'Artikel', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Complex article. 6 questions (a,b,c)']) },
          { teil: 3, unit: 'ITEM', title: 'Sätze einsetzen', taskType: 'CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Information', context: 'Artikel', textGenre: 'BERICHT', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Text with 6 missing sentences (a-h)']) },
          { teil: 4, unit: 'ITEM', title: 'Regeln R/F', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 4, rawPoints: 4, content: { topicCategory: 'Beruf', context: 'Regeln', textGenre: 'HAUSORDNUNG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['University or work regulations. Richtig/Falsch']) },
          { teil: 5, unit: 'ITEM', title: 'Wissenschaftstext MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Lexikon', context: 'Wissenschaft', textGenre: 'BERICHT', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Detailed academic/scientific text. a,b,c choices']) }
        ]
      },
      {
        moduleId: 'GOETHE_B2_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: '5 Gespräche', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, audioReplay: 1, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Gespräche', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 texts, 2 questions each, heard once']) },
          { teil: 2, unit: 'ITEM', title: 'Vortrag MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, audioReplay: 2, rawPoints: 6, content: { topicCategory: 'Information', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Lecture heard twice, a/b/c']) },
          { teil: 3, unit: 'ITEM', title: 'Diskussion Zuordnung', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, audioReplay: 1, rawPoints: 6, content: { topicCategory: 'Gesellschaft', context: 'Diskussion', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Discussion heard once, assign statements to speakers']) },
          { teil: 4, unit: 'ITEM', title: 'Radiointerview MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 8, audioReplay: 2, rawPoints: 8, content: { topicCategory: 'Alltag', context: 'Radio', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Radio interview heard twice, a/b/c']) }
        ]
      },
      {
        moduleId: 'GOETHE_B2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 75, totalItems: 2, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Forumsbeitrag', taskType: 'ARGUMENTATIVE_ESSAY', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 60, content: { topicCategory: 'Gesellschaft', context: 'Forum', textGenre: 'ESSAY', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write a forum post (150 words)', 'Outline alternatives and advantages']) },
          { teil: 2, unit: 'TASK', title: 'Formelle Nachricht', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 40, content: { topicCategory: 'Beruf', context: 'Formell', textGenre: 'EMAIL', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal email in workplace context (100 words)']) }
        ]
      },
      {
        moduleId: 'GOETHE_B2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 2, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Präsentation', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 50, content: { topicCategory: 'Vortrag', context: 'Monolog', textGenre: 'VORTRAG', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Deliver presentation on chosen topic and answer follow-up questions']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 50, content: { topicCategory: 'Diskussion', context: 'Meinungsaustausch', textGenre: 'DISKUSSION', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Discuss controversial topic with partner and exchange arguments']) }
        ]
      }
    ]
  },

  'GOETHE_C1_2026': {
    blueprintId: 'GOETHE_C1_2026', provider: 'GOETHE', level: 'C1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'GOETHE_C1_LESEN', skill: 'LESEN', durationMinutes: 65, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Lückentext MC', taskType: 'CLOZE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 8, optionsCount: 4, rawPoints: 8, content: { topicCategory: 'Wissenschaft', context: 'Akademisch', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['8 blanks multiple choice']) },
          { teil: 2, unit: 'ITEM', title: 'Text und Aussagen', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 7, optionsCount: 4, rawPoints: 7, content: { topicCategory: 'Forschung', context: 'Presse', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['7 complex reading comprehension questions']) },
          { teil: 3, unit: 'ITEM', title: 'Textabschnitte einsetzen', taskType: 'CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Geschichte', context: 'Artikel', textGenre: 'BERICHT', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Insert 6 missing paragraphs into text']) },
          { teil: 4, unit: 'ITEM', title: 'Meinungen zuordnen', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 9, rawPoints: 9, content: { topicCategory: 'Regularien', context: 'Ordnung', textGenre: 'HAUSORDNUNG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 9 statements to multiple speakers/opinions']) }
        ]
      },
      {
        moduleId: 'GOETHE_C1_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Podcast Zuordnung', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Kultur', context: 'Podcast', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['6 items matching heard once']) },
          { teil: 2, unit: 'ITEM', title: 'Interview Stimmt/Nicht', taskType: 'TRUE_FALSE_NOT_GIVEN', answerType: 'NOT_GIVEN', responseMode: 'SELECT', itemCount: 9, rawPoints: 9, content: { topicCategory: 'Wissenschaft', context: 'Interview', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['9 items stimmt/stimmt nicht/nicht gesagt']) },
          { teil: 3, unit: 'ITEM', title: 'Gespräch Aussagen', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 8, rawPoints: 8, content: { topicCategory: 'Gesellschaft', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['8 items matching statements']) },
          { teil: 4, unit: 'ITEM', title: 'Vortrag MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 7, optionsCount: 4, rawPoints: 7, content: { topicCategory: 'Forschung', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['7 multiple choice questions on academic lecture']) }
        ]
      },
      {
        moduleId: 'GOETHE_C1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 80, totalItems: 2, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Stellungnahme mit Grafik', taskType: 'GRAPH_DESCRIPTION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 70, content: { topicCategory: 'Wissenschaft', context: 'Grafik', textGenre: 'ESSAY', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Describe graphic and write structured argument (approx 200 words)']) },
          { teil: 2, unit: 'TASK', title: 'Formelle Nachricht', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 30, content: { topicCategory: 'Beruf', context: 'Formell', textGenre: 'EMAIL', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal email requesting information or stating complaint (approx 100 words)']) }
        ]
      },
      {
        moduleId: 'GOETHE_C1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 2, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Vortrag', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 50, content: { topicCategory: 'Wissenschaft', context: 'Fachvortrag', textGenre: 'VORTRAG', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['5-minute academic presentation followed by questions']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 50, content: { topicCategory: 'Debatte', context: 'Fachgespräch', textGenre: 'DEBATTE', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['5-minute controversial academic discussion with partner']) }
        ]
      }
    ]
  },

  'GOETHE_C2_2026': {
    blueprintId: 'GOETHE_C2_2026', provider: 'GOETHE', level: 'C2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'GOETHE_C2_LESEN', skill: 'LESEN', durationMinutes: 80, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1 MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 4, rawPoints: 10, content: { topicCategory: 'Wissenschaft', context: 'Text', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 complex multiple choice questions']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2 Zuordnung', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 7, rawPoints: 7, content: { topicCategory: 'Gesellschaft', context: 'Artikel', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 7 statements to sections of a demanding text']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3 Abschnitte', taskType: 'CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Forschung', context: 'Bericht', textGenre: 'BERICHT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Insert 6 missing text sections']) },
          { teil: 4, unit: 'ITEM', title: 'Aufgabe 4 Personen', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 7, rawPoints: 7, content: { topicCategory: 'Diskussion', context: 'Meinungen', textGenre: 'KOMMENTAR', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 7 statements to multiple authors']) }
        ]
      },
      {
        moduleId: 'GOETHE_C2_HOEREN', skill: 'HOEREN', durationMinutes: 35, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1 Radio', taskType: 'YES_NO', answerType: 'YES_NO', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Medien', context: 'Radio', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 radio excerpts Ja/Nein']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2 Diskussion', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Gesellschaft', context: 'Diskussion', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 matching items based on panel discussion']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3 Interview', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 3, rawPoints: 10, content: { topicCategory: 'Wissenschaft', context: 'Interview', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 multiple choice questions on demanding interview']) }
        ]
      },
      {
        moduleId: 'GOETHE_C2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 80, totalItems: 2, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Aufgabe 1 Textüberarbeitung', taskType: 'TEXT_RECONSTRUCTION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 20, rawPoints: 40, content: { topicCategory: 'Sprache', context: 'Akademisch', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Transform and rewrite text using supplied vocabulary across 20 slots']) },
          { teil: 2, unit: 'TASK', title: 'Aufgabe 2 Essay', taskType: 'ARGUMENTATIVE_ESSAY', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 60, content: { topicCategory: 'Literatur', context: 'Essay', textGenre: 'ESSAY', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write comprehensive argumentative text (approx 350 words) from choice of topics']) }
        ]
      },
      {
        moduleId: 'GOETHE_C2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 2, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Vortrag', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 50, content: { topicCategory: 'Wissenschaft', context: 'Monolog', textGenre: 'VORTRAG', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Demanding academic oral presentation']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 50, content: { topicCategory: 'Gesellschaft', context: 'Interaktion', textGenre: 'DEBATTE', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['High-level argumentation and debate with examiner']) }
        ]
      }
    ]
  },

  'TELC_A1_2026': {
    blueprintId: 'TELC_A1_2026', provider: 'TELC', level: 'A1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'TELC_A1_LESEN', skill: 'LESEN', durationMinutes: 25, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'E-Mails Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'E-Mail', textGenre: 'EMAIL', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 2, unit: 'ITEM', title: 'Websites a/b', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 2, rawPoints: 5, content: { topicCategory: 'Information', context: 'Internet', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items choice a/b']) },
          { teil: 3, unit: 'ITEM', title: 'Schilder Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Öffentlichkeit', context: 'Schilder', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) }
        ]
      },
      {
        moduleId: 'TELC_A1_HOEREN', skill: 'HOEREN', durationMinutes: 20, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Gespräche', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, audioReplay: 2, rawPoints: 6, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['6 items MC']) },
          { teil: 2, unit: 'ITEM', title: 'Durchsagen', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 4, audioReplay: 1, rawPoints: 4, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['4 items Richtig/Falsch']) },
          { teil: 3, unit: 'ITEM', title: 'Telefon', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items MC']) }
        ]
      },
      {
        moduleId: 'TELC_A1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 20, totalItems: 2, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Formular', taskType: 'FORM_FILLING', answerType: 'SHORT_TEXT', responseMode: 'INPUT_TEXT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Persönliches', context: 'Formular', textGenre: 'BERICHT', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Fill 5 form fields']) },
          { teil: 2, unit: 'TASK', title: 'Kurzer Brief', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Privat', textGenre: 'EMAIL', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write short text approx 30 words']) }
        ]
      },
      {
        moduleId: 'TELC_A1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Sich vorstellen', taskType: 'SELF_INTRODUCTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Vorstellung', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Introduce self and spell name']) },
          { teil: 2, unit: 'TASK', title: 'Informationen erfragen', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Information', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Ask for information using word cards']) },
          { teil: 3, unit: 'TASK', title: 'Bitten formulieren', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Bitten', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formulate request and respond']) }
        ]
      }
    ]
  },

  'TELC_A2_2026': {
    blueprintId: 'TELC_A2_2026', provider: 'TELC', level: 'A2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'TELC_A2_LESEN', skill: 'LESEN', durationMinutes: 30, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Zeitungstexte', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Zeitung', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 5 headlines to texts']) },
          { teil: 2, unit: 'ITEM', title: 'Informationstexte', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Information', context: 'Info', textGenre: 'ANZEIGE', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items a/b/c']) },
          { teil: 3, unit: 'ITEM', title: 'Aushänge', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Aushänge', textGenre: 'ANZEIGE', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 matching items']) }
        ]
      },
      {
        moduleId: 'TELC_A2_HOEREN', skill: 'HOEREN', durationMinutes: 20, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Gespräche', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard twice']) },
          { teil: 2, unit: 'ITEM', title: 'Durchsagen', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard once']) },
          { teil: 3, unit: 'ITEM', title: 'Interviews', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard twice']) }
        ]
      },
      {
        moduleId: 'TELC_A2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 30, totalItems: 1, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Persönliche Mitteilung', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 15, content: { topicCategory: 'Alltag', context: 'Privat', textGenre: 'EMAIL', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write message of approx 40 words with 3 Leitpunkte']) }
        ]
      },
      {
        moduleId: 'TELC_A2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Fragen zur Person', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Persönliches', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Ask and answer questions about daily life']) },
          { teil: 2, unit: 'TASK', title: 'Vom Alltag berichten', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Report about a personal topic']) },
          { teil: 3, unit: 'TASK', title: 'Gemeinsam planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Planung', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Plan an activity together']) }
        ]
      }
    ]
  },

  'TELC_B1_2026': {
    blueprintId: 'TELC_B1_2026', provider: 'TELC', level: 'B1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'TELC_B1_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 20, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Überschriften zuordnen', taskType: 'HEADLINE_MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Zeitung', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 texts to match with 8 headlines (a-h)']) },
          { teil: 2, unit: 'ITEM', title: 'Pressetext MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 25, content: { topicCategory: 'Gesellschaft', context: 'Presse', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['1 long text (300 words)', '5 questions, exactly 3 options (a, b, c)']) },
          { teil: 3, unit: 'ITEM', title: 'Anzeigen Zuordnung', taskType: 'ADVERTISEMENT_MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Anzeigen', textGenre: 'ANZEIGE', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 2.5, humanEvaluation: false }, generationRules: strictRules(['10 situations, 12 ads', 'Must include option x - Keine Anzeige passt']) }
        ]
      },
      {
        moduleId: 'TELC_B1_SPRACHBAUSTEINE', skill: 'SPRACHBAUSTEINE', durationMinutes: 30, totalItems: 20, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Sprachbausteine Teil 1', taskType: 'SPRACHBAUSTEINE_CLOZE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 3, rawPoints: 15, content: { topicCategory: 'Brief', context: 'Korrespondenz', textGenre: 'BRIEF', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1.5, humanEvaluation: false }, generationRules: strictRules(['A letter with 10 blanks', 'Each blank has 3 grammar options a/b/c']) },
          { teil: 2, unit: 'ITEM', title: 'Sprachbausteine Teil 2', taskType: 'SPRACHBAUSTEINE_CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 15, content: { topicCategory: 'Brief', context: 'Korrespondenz', textGenre: 'BRIEF', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1.5, humanEvaluation: false }, generationRules: strictRules(['A letter with 10 blanks', 'Options chosen from a word bank a-o']) }
        ]
      },
      {
        moduleId: 'TELC_B1_HOEREN', skill: 'HOEREN', durationMinutes: 30, totalItems: 20, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Teil 1 Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 2, unit: 'ITEM', title: 'Teil 2 Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 10, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 2.5, humanEvaluation: false }, generationRules: strictRules(['10 items Richtig/Falsch']) },
          { teil: 3, unit: 'ITEM', title: 'Teil 3 Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) }
        ]
      },
      {
        moduleId: 'TELC_B1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 30, totalItems: 1, totalRawPoints: 45,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Brief schreiben', taskType: 'LETTER', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 45, content: { topicCategory: 'Beschwerde', context: 'Formell', textGenre: 'BRIEF', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal email/letter', 'Exactly 4 Leitpunkte to cover']) }
        ]
      },
      {
        moduleId: 'TELC_B1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Einander kennenlernen', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 15, content: { topicCategory: 'Kennenlernen', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Teil 1: Einander kennenlernen']) },
          { teil: 2, unit: 'TASK', title: 'Über ein Thema sprechen', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 30, content: { topicCategory: 'Thema', context: 'Diskussion', textGenre: 'DISKUSSION', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Teil 2: Über ein Thema sprechen']) },
          { teil: 3, unit: 'TASK', title: 'Gemeinsam etwas planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 30, content: { topicCategory: 'Planung', context: 'Problemlösung', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Teil 3: Gemeinsam etwas planen']) }
        ]
      }
    ]
  },

  'TELC_B2_2026': {
    blueprintId: 'TELC_B2_2026', provider: 'TELC', level: 'B2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'TELC_B2_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 20, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Textabschnitte zuordnen', taskType: 'TEXT_MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Meinung', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['Match 5 statements to 5 paragraphs']) },
          { teil: 2, unit: 'ITEM', title: 'Artikel MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 25, content: { topicCategory: 'Information', context: 'Zeitung', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['Complex text with 5 questions a/b/c']) },
          { teil: 3, unit: 'ITEM', title: 'Anzeigen Zuordnung', taskType: 'ADVERTISEMENT_MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 25, content: { topicCategory: 'Beruf', context: 'Anzeigen', textGenre: 'ANZEIGE', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 2.5, humanEvaluation: false }, generationRules: strictRules(['10 situations, 12 ads with x option']) }
        ]
      },
      {
        moduleId: 'TELC_B2_SPRACHBAUSTEINE', skill: 'SPRACHBAUSTEINE', durationMinutes: 30, totalItems: 20, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Sprachbausteine MC', taskType: 'SPRACHBAUSTEINE_CLOZE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 3, rawPoints: 15, content: { topicCategory: 'Formell', context: 'Brief', textGenre: 'BRIEF', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1.5, humanEvaluation: false }, generationRules: strictRules(['Cloze test. 3 options a/b/c per blank']) },
          { teil: 2, unit: 'ITEM', title: 'Sprachbausteine Wortschatz', taskType: 'SPRACHBAUSTEINE_CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 15, content: { topicCategory: 'Formell', context: 'Brief', textGenre: 'BRIEF', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1.5, humanEvaluation: false }, generationRules: strictRules(['Cloze test matching from box of 15 words']) }
        ]
      },
      {
        moduleId: 'TELC_B2_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 20, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Teil 1 Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 2, unit: 'ITEM', title: 'Teil 2 Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 10, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 2.5, humanEvaluation: false }, generationRules: strictRules(['10 items Richtig/Falsch']) },
          { teil: 3, unit: 'ITEM', title: 'Teil 3 Richtig/Falsch', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) }
        ]
      },
      {
        moduleId: 'TELC_B2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 30, totalItems: 1, totalRawPoints: 45,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Formeller Brief', taskType: 'LETTER', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 45, content: { topicCategory: 'Beruf', context: 'Beschwerde', textGenre: 'BRIEF', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal letter', 'Exactly 3 Leitpunkte', '150 words']) }
        ]
      },
      {
        moduleId: 'TELC_B2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Präsentation', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, durationMinutes: 5, rawPoints: 25, content: { topicCategory: 'Präsentation', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Präsentation eines Themas']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, durationMinutes: 5, rawPoints: 25, content: { topicCategory: 'Diskussion', context: 'Meinungsstreit', textGenre: 'DISKUSSION', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Diskussion zu einem kontroversen Thema']) },
          { teil: 3, unit: 'TASK', title: 'Gemeinsam planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, durationMinutes: 5, rawPoints: 25, content: { topicCategory: 'Organisation', context: 'Planung', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Gemeinsam etwas planen']) }
        ]
      }
    ]
  },

  'TELC_C1_2026': {
    blueprintId: 'TELC_C1_2026', provider: 'TELC', level: 'C1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'TELC_C1_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 25, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Lesen Teil 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 25, content: { topicCategory: 'Gesellschaft', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 4.16, humanEvaluation: false }, generationRules: strictRules(['Match statements to texts']) },
          { teil: 2, unit: 'ITEM', title: 'Lesen Teil 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, optionsCount: 4, rawPoints: 25, content: { topicCategory: 'Information', context: 'Zeitung', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 4.16, humanEvaluation: false }, generationRules: strictRules(['Complex text with 6 questions a/b/c/d']) },
          { teil: 3, unit: 'ITEM', title: 'Lesen Teil 3', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 13, rawPoints: 25, content: { topicCategory: 'Beruf', context: 'Anzeigen', textGenre: 'ANZEIGE', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1.92, humanEvaluation: false }, generationRules: strictRules(['Matching items with distractors']) }
        ]
      },
      {
        moduleId: 'TELC_C1_SPRACHBAUSTEINE', skill: 'SPRACHBAUSTEINE', durationMinutes: 20, totalItems: 10, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Sprachbausteine Cloze', taskType: 'SPRACHBAUSTEINE_CLOZE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 4, rawPoints: 20, content: { topicCategory: 'Formell', context: 'Text', textGenre: 'BERICHT', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 2, humanEvaluation: false }, generationRules: strictRules(['Cloze test. Exactly 1 Teil. 4 options per blank']) }
        ]
      },
      {
        moduleId: 'TELC_C1_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 20, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Hören Teil 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 items matching']) },
          { teil: 2, unit: 'ITEM', title: 'Hören Teil 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 3, rawPoints: 25, content: { topicCategory: 'Information', context: 'Audio', textGenre: 'VORTRAG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 2.5, humanEvaluation: false }, generationRules: strictRules(['10 items MC']) },
          { teil: 3, unit: 'ITEM', title: 'Hören Teil 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Gesellschaft', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) }
        ]
      },
      {
        moduleId: 'TELC_C1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 60, totalItems: 1, totalRawPoints: 45,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Schriftlicher Ausdruck', taskType: 'ARGUMENTATION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 45, content: { topicCategory: 'Gesellschaft', context: 'Argumentation', textGenre: 'ESSAY', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Academic/formal essay or argumentation based on prompt']) }
        ]
      },
      {
        moduleId: 'TELC_C1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Präsentation', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Präsentation', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Präsentation eines Themas']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Diskussion', context: 'Meinungsstreit', textGenre: 'DISKUSSION', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Diskussion zu einem kontroversen Thema']) },
          { teil: 3, unit: 'TASK', title: 'Problemlösung', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Organisation', context: 'Planung', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Gemeinsam etwas planen']) }
        ]
      }
    ]
  },

  'TELC_C2_2026': {
    blueprintId: 'TELC_C2_2026', provider: 'TELC', level: 'C2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'TELC_C2_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 25, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Leseverstehen 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 25, content: { topicCategory: 'Wissenschaft', context: 'Text', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 4.16, humanEvaluation: false }, generationRules: strictRules(['High-level text matching']) },
          { teil: 2, unit: 'ITEM', title: 'Leseverstehen 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, optionsCount: 4, rawPoints: 25, content: { topicCategory: 'Gesellschaft', context: 'Presse', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 4.16, humanEvaluation: false }, generationRules: strictRules(['6 demanding questions a/b/c/d']) },
          { teil: 3, unit: 'ITEM', title: 'Leseverstehen 3', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 13, rawPoints: 25, content: { topicCategory: 'Beruf', context: 'Text', textGenre: 'BERICHT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1.92, humanEvaluation: false }, generationRules: strictRules(['Demanding matching items']) }
        ]
      },
      {
        moduleId: 'TELC_C2_SPRACHBAUSTEINE', skill: 'SPRACHBAUSTEINE', durationMinutes: 20, totalItems: 10, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Sprachbausteine', taskType: 'SPRACHBAUSTEINE_CLOZE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 4, rawPoints: 20, content: { topicCategory: 'Akademisch', context: 'Text', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 2, humanEvaluation: false }, generationRules: strictRules(['Advanced cloze test']) }
        ]
      },
      {
        moduleId: 'TELC_C2_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 20, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Hörverstehen 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Wissenschaft', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 complex matching items']) },
          { teil: 2, unit: 'ITEM', title: 'Hörverstehen 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 4, rawPoints: 25, content: { topicCategory: 'Forschung', context: 'Audio', textGenre: 'VORTRAG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 2.5, humanEvaluation: false }, generationRules: strictRules(['10 MC items on lecture']) },
          { teil: 3, unit: 'ITEM', title: 'Hörverstehen 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 25, content: { topicCategory: 'Kultur', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 5, humanEvaluation: false }, generationRules: strictRules(['5 demanding true/false items']) }
        ]
      },
      {
        moduleId: 'TELC_C2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 60, totalItems: 1, totalRawPoints: 45,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Essay/Bericht', taskType: 'ARGUMENTATION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 45, content: { topicCategory: 'Fachgebiet', context: 'Essay', textGenre: 'ESSAY', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write C2-level argument or analytical report']) }
        ]
      },
      {
        moduleId: 'TELC_C2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 75,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Vortrag', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Wissenschaft', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Deliver C2 academic presentation']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Gesellschaft', context: 'Debatte', textGenre: 'DEBATTE', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['High-level debate']) },
          { teil: 3, unit: 'TASK', title: 'Konsensfindung', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Organisation', context: 'Verhandlung', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Complex negotiation to reach consensus']) }
        ]
      }
    ]
  },

  'OESD_A1_2026': {
    blueprintId: 'OESD_A1_2026', provider: 'OESD', level: 'A1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'OESD_A1_LESEN', skill: 'LESEN', durationMinutes: 25, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Info', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Info', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items a/b/c']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Info', textGenre: 'ANZEIGE', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) }
        ]
      },
      {
        moduleId: 'OESD_A1_HOEREN', skill: 'HOEREN', durationMinutes: 20, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Gespräche', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard twice']) },
          { teil: 2, unit: 'ITEM', title: 'Durchsagen', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard once']) },
          { teil: 3, unit: 'ITEM', title: 'Nachrichten', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard twice']) }
        ]
      },
      {
        moduleId: 'OESD_A1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 20, totalItems: 2, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Formular ausfüllen', taskType: 'FORM_FILLING', answerType: 'SHORT_TEXT', responseMode: 'INPUT_TEXT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Formular', textGenre: 'BERICHT', cefrLevel: 'A1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Fill 5 fields']) },
          { teil: 2, unit: 'TASK', title: 'E-Mail', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Privat', textGenre: 'EMAIL', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Short personal text 30 words']) }
        ]
      },
      {
        moduleId: 'OESD_A1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Sich vorstellen', taskType: 'SELF_INTRODUCTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Vorstellung', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Introduce self']) },
          { teil: 2, unit: 'TASK', title: 'Fragen stellen', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Information', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Ask questions']) },
          { teil: 3, unit: 'TASK', title: 'Bitten formulieren', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 5, content: { topicCategory: 'Bitten', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formulate requests']) }
        ]
      }
    ]
  },

  'OESD_A2_2026': {
    blueprintId: 'OESD_A2_2026', provider: 'OESD', level: 'A2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'OESD_A2_LESEN', skill: 'LESEN', durationMinutes: 30, totalItems: 10, totalRawPoints: 10,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Artikel', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 matching items']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Info', textGenre: 'BERICHT', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items a/b/c']) }
        ]
      },
      {
        moduleId: 'OESD_A2_HOEREN', skill: 'HOEREN', durationMinutes: 20, totalItems: 15, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Alltagsgespräche', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard twice']) },
          { teil: 2, unit: 'ITEM', title: 'Durchsagen', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard once']) },
          { teil: 3, unit: 'ITEM', title: 'Interviews', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 2, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items heard twice']) }
        ]
      },
      {
        moduleId: 'OESD_A2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 30, totalItems: 1, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'E-Mail schreiben', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 15, content: { topicCategory: 'Alltag', context: 'Privat', textGenre: 'EMAIL', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Write an email approx 50 words']) }
        ]
      },
      {
        moduleId: 'OESD_A2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 2, totalRawPoints: 15,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Gespräch zur Person', taskType: 'ROLE_PLAY', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 7, content: { topicCategory: 'Alltag', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Speak about oneself and daily life']) },
          { teil: 2, unit: 'TASK', title: 'Gemeinsame Aktivität planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 8, content: { topicCategory: 'Planung', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'A2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Plan an activity together']) }
        ]
      }
    ]
  },

  'OESD_B1_2026': {
    blueprintId: 'OESD_B1_2026', provider: 'OESD', level: 'B1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'OESD_B1_LESEN', skill: 'LESEN', durationMinutes: 65, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1 Blog', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Alltag', context: 'Blog', textGenre: 'BLOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['6 statements Richtig/Falsch']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2 Presse', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 6, optionsCount: 3, rawPoints: 6, content: { topicCategory: 'Österreich/DACH', context: 'Zeitung', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['6 questions a/b/c on DACH newspaper']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3 Anzeigen', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 7, rawPoints: 7, content: { topicCategory: 'Service', context: 'Anzeigen', textGenre: 'ANZEIGE', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 7 situations to ads']) },
          { teil: 4, unit: 'ITEM', title: 'Aufgabe 4 Forum', taskType: 'YES_NO', answerType: 'YES_NO', responseMode: 'SELECT', itemCount: 7, rawPoints: 7, content: { topicCategory: 'Diskussion', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['7 forum comments Ja/Nein']) },
          { teil: 5, unit: 'ITEM', title: 'Aufgabe 5 Hausordnung', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 4, optionsCount: 3, rawPoints: 4, content: { topicCategory: 'Hausordnung', context: 'Regeln', textGenre: 'HAUSORDNUNG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['4 questions on rules']) }
        ]
      },
      {
        moduleId: 'OESD_B1_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 30, totalRawPoints: 30,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Teil 1 Kurze Texte', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 10, audioReplay: 2, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 short texts, 2 items each, heard twice']) },
          { teil: 2, unit: 'ITEM', title: 'Teil 2 Vortrag', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Information', context: 'Audio', textGenre: 'VORTRAG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items on longer text']) },
          { teil: 3, unit: 'ITEM', title: 'Teil 3 Diskussion', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, audioReplay: 1, rawPoints: 5, content: { topicCategory: 'Gesellschaft', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 4, unit: 'ITEM', title: 'Teil 4 Radio', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, audioReplay: 2, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 items heard twice']) }
        ]
      },
      {
        moduleId: 'OESD_B1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 60, totalItems: 3, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'E-Mail persönlich', taskType: 'EMAIL_PERSONAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 33, content: { topicCategory: 'Privat', context: 'E-Mail', textGenre: 'EMAIL', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Personal email 80 words']) },
          { teil: 2, unit: 'TASK', title: 'Meinung äußern', taskType: 'FORUM_POST', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 33, content: { topicCategory: 'Meinung', context: 'Forum', textGenre: 'FORUM', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Express opinion in forum 80 words']) },
          { teil: 3, unit: 'TASK', title: 'Formelle E-Mail', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 34, content: { topicCategory: 'Entschuldigung', context: 'Formell', textGenre: 'EMAIL', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal apology 40 words']) }
        ]
      },
      {
        moduleId: 'OESD_B1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 100,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Sich vorstellen', taskType: 'SELF_INTRODUCTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Vorstellung', context: 'Kennenlernen', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Contact and personal conversation']) },
          { teil: 2, unit: 'TASK', title: 'Bildbeschreibung', taskType: 'PICTURE_DESCRIPTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 45, content: { topicCategory: 'Bildbeschreibung', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Describe picture and report personal experience']) },
          { teil: 3, unit: 'TASK', title: 'Gemeinsam planen', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 30, content: { topicCategory: 'Planung', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'B1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Plan an activity together']) }
        ]
      }
    ]
  },

  'OESD_B2_2026': {
    blueprintId: 'OESD_B2_2026', provider: 'OESD', level: 'B2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'OESD_B2_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1 Zuordnung', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Gesellschaft', context: 'Artikel', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Match 5 statements/headings to short texts']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2 Artikel MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 3, rawPoints: 5, content: { topicCategory: 'Alltag', context: 'Info', textGenre: 'BERICHT', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Read complex text and answer 5 multiple choice questions (a,b,c)']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3 R/F', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Meinung', context: 'Kommentar', textGenre: 'KOMMENTAR', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Read opinions or arguments, answer Richtig/Falsch']) },
          { teil: 4, unit: 'ITEM', title: 'Aufgabe 4 Lückentext', taskType: 'CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Information', context: 'Regeln', textGenre: 'HAUSORDNUNG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['Fill 5 blanks in formal text with given phrases']) }
        ]
      },
      {
        moduleId: 'OESD_B2_HOEREN', skill: 'HOEREN', durationMinutes: 30, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Globalverständnis', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Alltag', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 items true/false on conversation']) },
          { teil: 2, unit: 'ITEM', title: 'Detailverständnis MC', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 3, rawPoints: 10, content: { topicCategory: 'Information', context: 'Audio', textGenre: 'VORTRAG', cefrLevel: 'B2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 MC items on presentation']) }
        ]
      },
      {
        moduleId: 'OESD_B2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 90, totalItems: 2, totalRawPoints: 35,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Aufgabe 1 E-Mail', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 15, content: { topicCategory: 'Beruf', context: 'Beschwerde', textGenre: 'EMAIL', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal email (Beschwerde/Bitte), approx 120 words with 3 Leitpunkte']) },
          { teil: 2, unit: 'TASK', title: 'Aufgabe 2 Meinungsäußerung', taskType: 'ARGUMENTATIVE_ESSAY', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Meinung', context: 'Artikel', textGenre: 'ESSAY', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Argumentative text expressing opinion on social topic, approx 150 words']) }
        ]
      },
      {
        moduleId: 'OESD_B2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 15, totalItems: 3, totalRawPoints: 35,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Beratungsgespräch', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 15, content: { topicCategory: 'Beratung', context: 'Gespräch', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Provide information and advise partner']) },
          { teil: 2, unit: 'TASK', title: 'Bildbeschreibung', taskType: 'PICTURE_DESCRIPTION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Gesellschaft', context: 'Bild', textGenre: 'VORTRAG', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Describe and analyze image']) },
          { teil: 3, unit: 'TASK', title: 'Entscheidungsdiskussion', taskType: 'JOINT_PLANNING', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 10, content: { topicCategory: 'Diskussion', context: 'Entscheidung', textGenre: 'DIALOG', cefrLevel: 'B2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Debate and negotiate final decision with partner']) }
        ]
      }
    ]
  },

  'OESD_C1_2026': {
    blueprintId: 'OESD_C1_2026', provider: 'OESD', level: 'C1', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'OESD_C1_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Text', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 high-level matching items']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 4, rawPoints: 5, content: { topicCategory: 'Gesellschaft', context: 'Artikel', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 complex multiple choice items a/b/c/d']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Meinung', context: 'Kommentar', textGenre: 'KOMMENTAR', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 4, unit: 'ITEM', title: 'Aufgabe 4', taskType: 'CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Regularien', context: 'Ordnung', textGenre: 'HAUSORDNUNG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 cloze insertion items']) }
        ]
      },
      {
        moduleId: 'OESD_C1_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Hören Teil 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 10, rawPoints: 10, content: { topicCategory: 'Wissenschaft', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 matching items']) },
          { teil: 2, unit: 'ITEM', title: 'Hören Teil 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 10, optionsCount: 4, rawPoints: 10, content: { topicCategory: 'Wissenschaft', context: 'Audio', textGenre: 'VORTRAG', cefrLevel: 'C1' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['10 complex MC items on academic speech']) }
        ]
      },
      {
        moduleId: 'OESD_C1_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 90, totalItems: 2, totalRawPoints: 40,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Formeller Brief/Stellungnahme', taskType: 'EMAIL_FORMAL', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Beruf', context: 'Formell', textGenre: 'EMAIL', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Formal workplace communication approx 150 words']) },
          { teil: 2, unit: 'TASK', title: 'Essay/Kommentar', taskType: 'ARGUMENTATIVE_ESSAY', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Wissenschaft', context: 'Essay', textGenre: 'ESSAY', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Demanding argumentative essay approx 200 words']) }
        ]
      },
      {
        moduleId: 'OESD_C1_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 20, totalItems: 2, totalRawPoints: 40,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Vortrag', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Wissenschaft', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Academic oral presentation on topic']) },
          { teil: 2, unit: 'TASK', title: 'Fachdiskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 20, content: { topicCategory: 'Debatte', context: 'Debatte', textGenre: 'DEBATTE', cefrLevel: 'C1' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Academic debate and defense of arguments']) }
        ]
      }
    ]
  },

  'OESD_C2_2026': {
    blueprintId: 'OESD_C2_2026', provider: 'OESD', level: 'C2', version: '2026.1', paperOrDigital: 'PAPER',
    modules: [
      {
        moduleId: 'OESD_C2_LESEN', skill: 'LESEN', durationMinutes: 90, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Aufgabe 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Wissenschaft', context: 'Text', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['High-level C2 matching']) },
          { teil: 2, unit: 'ITEM', title: 'Aufgabe 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 5, optionsCount: 4, rawPoints: 5, content: { topicCategory: 'Literatur', context: 'Text', textGenre: 'ZEITUNGSARTIKEL', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 complex literary/analytical questions']) },
          { teil: 3, unit: 'ITEM', title: 'Aufgabe 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Gesellschaft', context: 'Essay', textGenre: 'KOMMENTAR', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 items Richtig/Falsch']) },
          { teil: 4, unit: 'ITEM', title: 'Aufgabe 4', taskType: 'CLOZE', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 5, rawPoints: 5, content: { topicCategory: 'Forschung', context: 'Fachtext', textGenre: 'WISSENSCHAFTLICHER_TEXT', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['5 text section reconstruction items']) }
        ]
      },
      {
        moduleId: 'OESD_C2_HOEREN', skill: 'HOEREN', durationMinutes: 40, totalItems: 20, totalRawPoints: 20,
        tasks: [
          { teil: 1, unit: 'ITEM', title: 'Hören Teil 1', taskType: 'MATCHING', answerType: 'MATCHING', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Wissenschaft', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['6 matching items']) },
          { teil: 2, unit: 'ITEM', title: 'Hören Teil 2', taskType: 'SINGLE_CHOICE', answerType: 'CHOICE', responseMode: 'SELECT', itemCount: 8, optionsCount: 4, rawPoints: 8, content: { topicCategory: 'Wissenschaft', context: 'Audio', textGenre: 'VORTRAG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['8 complex MC items on academic lecture']) },
          { teil: 3, unit: 'ITEM', title: 'Hören Teil 3', taskType: 'TRUE_FALSE', answerType: 'TRUE_FALSE', responseMode: 'SELECT', itemCount: 6, rawPoints: 6, content: { topicCategory: 'Kultur', context: 'Audio', textGenre: 'DIALOG', cefrLevel: 'C2' }, scoring: { method: 'objective', pointsPerItem: 1, humanEvaluation: false }, generationRules: strictRules(['6 demanding true/false items']) }
        ]
      },
      {
        moduleId: 'OESD_C2_SCHREIBEN', skill: 'SCHREIBEN', durationMinutes: 90, totalItems: 2, totalRawPoints: 50,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Komplexe Stellungnahme', taskType: 'ARGUMENTATION', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Akademisch', context: 'Facharbeit', textGenre: 'ESSAY', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Analytical academic argumentation approx 250 words']) },
          { teil: 2, unit: 'TASK', title: 'Essay/Rezension', taskType: 'ARGUMENTATIVE_ESSAY', answerType: 'FREE_TEXT', responseMode: 'LONG_TEXT', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Kultur', context: 'Rezension', textGenre: 'ESSAY', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Critical essay or review approx 250 words']) }
        ]
      },
      {
        moduleId: 'OESD_C2_SPRECHEN', skill: 'SPRECHEN', durationMinutes: 20, totalItems: 2, totalRawPoints: 50,
        tasks: [
          { teil: 1, unit: 'TASK', title: 'Vortrag', taskType: 'PRESENTATION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Wissenschaft', context: 'Vortrag', textGenre: 'VORTRAG', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['Demanding academic oral presentation']) },
          { teil: 2, unit: 'TASK', title: 'Diskussion', taskType: 'DISCUSSION', answerType: 'SPEAKING', responseMode: 'VOICE', itemCount: 1, rawPoints: 25, content: { topicCategory: 'Debatte', context: 'Debatte', textGenre: 'DEBATTE', cefrLevel: 'C2' }, scoring: { method: 'rubric', humanEvaluation: true }, generationRules: strictRules(['High-level argumentation and debate with examiner']) }
        ]
      }
    ]
  },

  'TESTDAF_TDN3_PAPER_2026': buildTestDaFPaperBlueprint('TDN3'),
  'TESTDAF_TDN4_PAPER_2026': buildTestDaFPaperBlueprint('TDN4'),
  'TESTDAF_TDN5_PAPER_2026': buildTestDaFPaperBlueprint('TDN5'),

  'TESTDAF_TDN3_DIGITAL_2026': buildTestDaFDigitalBlueprint('TDN3'),
  'TESTDAF_TDN4_DIGITAL_2026': buildTestDaFDigitalBlueprint('TDN4'),
  'TESTDAF_TDN5_DIGITAL_2026': buildTestDaFDigitalBlueprint('TDN5'),

  'TESTDAF_TDN3_2026': buildTestDaFPaperBlueprint('TDN3'),
  'TESTDAF_TDN4_2026': buildTestDaFPaperBlueprint('TDN4'),
  'TESTDAF_TDN5_2026': buildTestDaFPaperBlueprint('TDN5'),
};