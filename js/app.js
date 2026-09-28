/**
 * Application Entry Point - TestMyJMK
 * Inisialisasi arsitektur Model-View-Controller (OOP)
 */
document.addEventListener('DOMContentLoaded', () => {
  const model = new QuizModel();
  const view = new QuizView();
  const controller = new QuizController(model, view);

  controller.init();
});
