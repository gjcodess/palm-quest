export const FORMATS = {
  landscape: { label: 'Landscape screenshot', width: 1920, height: 1080 },
  portrait: { label: 'Portrait screenshot', width: 1080, height: 1920, mobile: true },
  tallPortrait: { label: 'Tall portrait poster', width: 1772, height: 3840, mobile: true },
  tablet: { label: 'Landscape tablet', width: 2560, height: 1440 },
  feature: { label: 'Feature graphic', width: 1024, height: 500 },
};

export const THEMES = {
  forest: { label: 'Palm green', bg: '#0c4537', ink: '#fff8e8', accent: '#f8ba47', muted: '#d0e0d4', panel: '#1b5b48' },
  cream: { label: 'Kitchen cream', bg: '#fff5df', ink: '#173e30', accent: '#b86516', muted: '#536457', panel: '#f1e3c6' },
  terracotta: { label: 'Golden harvest', bg: '#743b2a', ink: '#fff8e8', accent: '#ffd17c', muted: '#f1dac2', panel: '#874d37' },
};

export const TEMPLATES = [
  { id: 'cover', name: 'The virtual laboratory', eyebrow: 'COCONUT PALM • FOOD SCIENCE', headline: 'A little curiosity.\nA whole laboratory.', description: 'Explore how coconut palm becomes crispy crackers in an interactive virtual kitchen.', screenshot: 'preparation', artwork: 'teacher_mia_happy', tag: 'Learn with Teacher Mia' },
  { id: 'safety', name: 'Safety & hygiene', eyebrow: 'START WITH THE BASICS', headline: 'Good food starts\nwith safe habits.', description: 'Practice protective attire, handwashing, tool safety, and ingredient inspection.', screenshot: 'safety', artwork: 'sanitation_handwash_soap', tag: 'Prepare • Inspect • Practice' },
  { id: 'preparation', name: 'Interactive workstations', eyebrow: 'LEARN THROUGH ACTION', headline: 'Your kitchen.\nYour next discovery.', description: 'Choose ingredients and work through the preparation process, one guided step at a time.', screenshot: 'preparation', artwork: 'sink_colander_ubod', tag: 'Eight guided processing stages' },
  { id: 'formulation', name: 'Recipe & formulation', eyebrow: 'FROM INGREDIENTS TO IDEAS', headline: 'Mix ingredients.\nBuild understanding.', description: 'Follow recipe measurements and discover the food science behind each stage.', screenshot: 'formulation', artwork: 'tool_spatula_red', tag: 'Recipe & safety references' },
  { id: 'sequence', name: 'Process sequencing', eyebrow: 'CONNECT EVERY STEP', headline: 'See the process.\nFind the order.', description: 'Arrange the eight manufacturing stages to reinforce what you learned in the laboratory.', screenshot: 'sequence', artwork: 'pouch_with_crackers', tag: 'An interactive sequence challenge' },
  { id: 'review', name: 'Learning review', eyebrow: 'KEEP THE LEARNING GOING', headline: 'Every choice\nhas a lesson.', description: 'Revisit your answers, explore explanations, and review the complete processing guide.', screenshot: 'review', artwork: 'platter_crackers_cooled', tag: 'Answers • Explanations • Study guide' },
].map(template => ({
  ...template,
  secondScreenshot: {
    cover: 'formulation',
    safety: 'review',
    preparation: 'formulation',
    formulation: 'preparation',
    sequence: 'review',
    review: 'sequence',
  }[template.id],
}));
