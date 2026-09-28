/**
 * Controller Layer - QuizController
 * Mengoordinasikan Model dan View, mengikat interaksi pengguna,
 * dan menangani pemuatan data pertanyaan.
 */
class QuizController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  /**
   * Inisialisasi controller & muat data pertanyaan
   */
  async init() {
    await this.loadQuestionsData();
    this.bindEvents();
  }

  /**
   * Memuat data pertanyaan dari pertanyaan.json atau fallback questionsData.js
   */
  async loadQuestionsData() {
    try {
      // Coba fetch file pertanyaan.json
      const response = await fetch('pertanyaan.json');
      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
      }
      const data = await response.json();
      this.model.loadQuestions(data);
    } catch (err) {
      console.warn('Gagal memuat pertanyaan.json via fetch (kemungkinan dibuka via protokol file://). Menggunakan fallback QUESTIONS_DATA.', err);
      if (window.QUESTIONS_DATA && Array.isArray(window.QUESTIONS_DATA)) {
        this.model.loadQuestions(window.QUESTIONS_DATA);
      } else {
        alert('Gagal memuat data pertanyaan kuis. Pastikan pertanyaan.json atau questionsData.js tersedia.');
      }
    }
  }

  /**
   * Mengikat seluruh event listener antarmuka
   */
  bindEvents() {
    // 1. Submit Nama / Mulai Test
    this.view.btnStartQuiz.addEventListener('click', () => this.handleStartQuiz());
    this.view.inputUserName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleStartQuiz();
      }
    });

    this.view.inputUserName.addEventListener('input', () => {
      this.view.showNameError(false);
    });

    // 2. Klik Pilihan Jawaban (Event Delegation)
    this.view.optionsContainer.addEventListener('click', (e) => {
      const optionCard = e.target.closest('.option-card');
      if (optionCard && !this.view.isAnswerSubmitted) {
        const key = optionCard.getAttribute('data-key');
        this.view.highlightSelectedOption(key);
      }
    });

    // 3. Tombol Submit Jawaban (Instant Feedback)
    this.view.btnSubmitAnswer.addEventListener('click', () => this.handleSubmitAnswer());

    // 4. Tombol Pertanyaan Berikutnya
    this.view.btnNextQuestion.addEventListener('click', () => this.handleNextQuestion());

    // 5. Tombol Ulangi Kuis
    this.view.btnRestartQuiz.addEventListener('click', () => this.handleRestartQuiz());

    // 6. Tombol Salin / Bagikan Hasil
    this.view.btnShareResult.addEventListener('click', () => this.handleShareResult());

    // 7. Toggle Audio Backsound (Mute/Unmute)
    if (this.view.btnAudioToggle) {
      this.view.btnAudioToggle.addEventListener('click', () => {
        this.view.toggleBacksound();
      });
    }

    // 8. SFX Mouse Click untuk semua elemen button dan kartu opsi
    document.addEventListener('click', (e) => {
      const isInteractive = e.target.closest('button, .btn-jmk-primary, .btn-jmk-outline, .audio-toggle-btn, .option-card, a.brand-badge');
      if (isInteractive) {
        this.view.playClickSound();
      }
    });
  }

  /**
   * Handler saat tombol Mulai Test diklik
   */
  handleStartQuiz() {
    const rawName = this.view.inputUserName.value;
    if (!rawName || rawName.trim().length === 0) {
      this.view.showNameError(true);
      return;
    }

    this.model.setUserName(rawName);
    this.model.reset();

    // Otomatis nyalakan backsound kuis
    this.view.playBacksound();

    // Transisi dari Welcome Section ke Quiz Section
    this.view.switchSection(this.view.welcomeSection, this.view.quizSection, () => {
      this.renderCurrentQuestion();
    });
  }

  /**
   * Render pertanyaan saat ini pada View
   */
  renderCurrentQuestion() {
    const q = this.model.getCurrentQuestion();
    if (!q) return;

    this.view.renderQuestionSlide(
      q,
      this.model.getCurrentIndex(),
      this.model.getTotalQuestions(),
      this.model.getUserName()
    );
  }

  /**
   * Evaluasi jawaban secara instan pada detik itu juga
   */
  handleSubmitAnswer() {
    if (!this.view.selectedOptionKey || this.view.isAnswerSubmitted) return;

    const evalResult = this.model.submitAnswer(this.view.selectedOptionKey);
    this.view.showInstantFeedback(evalResult);
  }

  /**
   * Pindah ke slide soal berikutnya atau masuk ke layar hasil akhir jika sudah tamat
   */
  handleNextQuestion() {
    const hasNext = this.model.nextQuestion();
    if (hasNext) {
      this.renderCurrentQuestion();
    } else {
      // Sesi Kuis Selesai, masuk ke Layar Hasil
      const stats = this.model.getStatistics();
      const gradeInfo = this.model.getGradeInfo();
      const userName = this.model.getUserName();

      this.view.switchSection(this.view.quizSection, this.view.resultSection, () => {
        this.view.renderResults(stats, gradeInfo, userName);
      });
    }
  }

  /**
   * Reset kuis dan kembali ke layar registrasi awal
   */
  handleRestartQuiz() {
    this.model.reset();
    this.view.stopResultSounds();
    this.view.inputUserName.value = '';
    this.view.showNameError(false);

    this.view.switchSection(this.view.resultSection, this.view.welcomeSection);
  }

  /**
   * Menyalin teks ringkasan hasil ke clipboard
   */
  handleShareResult() {
    const stats = this.model.getStatistics();
    const grade = this.model.getGradeInfo();
    const name = this.model.getUserName();

    const shareText = `[TestMyJMK - Hasil Test Tingkat Kejomokan]\n` +
      `Nama: ${name}\n` +
      `Gelar: ${grade.badgeTitle}\n` +
      `Skor: ${stats.score} / 100 (${stats.correct} Benar, ${stats.wrong} Salah)\n` +
      `Status: ${grade.ribbonText}\n` +
      `Cek tingkat kejomokanmu di TestMyJMK!`;

    navigator.clipboard.writeText(shareText).then(() => {
      this.view.showToast('Hasil test berhasil disalin ke clipboard!');
    }).catch(() => {
      this.view.showToast('Gagal menyalin hasil secara otomatis.');
    });
  }
}
