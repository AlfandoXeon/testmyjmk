/**
 * Model Layer - QuizModel
 * Bertanggung jawab mengelola state kuis, data pertanyaan, logika penilaian,
 * dan kalkulasi badge gelar.
 */
class QuizModel {
  constructor() {
    this.userName = '';
    this.questions = [];
    this.currentIndex = 0;
    this.userAnswers = []; // { questionId, selectedKey, isCorrect }
  }

  /**
   * Inisialisasi daftar pertanyaan
   * @param {Array} questionsData 
   */
  loadQuestions(questionsData) {
    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error('Data pertanyaan tidak valid atau kosong.');
    }
    this.questions = [...questionsData];
    this.reset();
  }

  /**
   * Set nama pengguna
   * @param {string} name 
   */
  setUserName(name) {
    this.userName = (name || '').trim();
  }

  getUserName() {
    return this.userName || 'Peserta';
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getTotalQuestions() {
    return this.questions.length;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  /**
   * Evaluasi jawaban pengguna pada soal aktif
   * @param {string} selectedKey ('A' atau 'B')
   * @returns {Object} Hasil evaluasi seketika
   */
  submitAnswer(selectedKey) {
    const currentQ = this.getCurrentQuestion();
    if (!currentQ) return null;

    const correctOption = currentQ.options.find(opt => opt.isCorrect);
    const selectedOption = currentQ.options.find(opt => opt.key === selectedKey);
    const isCorrect = Boolean(selectedOption && selectedOption.isCorrect);

    // Simpan ke riwayat jawaban
    const answerRecord = {
      questionId: currentQ.id,
      selectedKey: selectedKey,
      isCorrect: isCorrect,
      correctKey: correctOption ? correctOption.key : '',
      correctText: correctOption ? correctOption.text : '',
      explanation: currentQ.explanation || ''
    };

    this.userAnswers[this.currentIndex] = answerRecord;

    return {
      isCorrect,
      selectedKey,
      correctKey: answerRecord.correctKey,
      correctText: answerRecord.correctText,
      explanation: answerRecord.explanation
    };
  }

  /**
   * Pindah ke pertanyaan berikutnya jika tersedia
   * @returns {boolean} true jika ada soal berikutnya, false jika sudah tamat
   */
  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  /**
   * Hitung statistik hasil kuis
   * @returns {Object}
   */
  getStatistics() {
    const total = this.questions.length;
    const correct = this.userAnswers.filter(ans => ans && ans.isCorrect).length;
    const wrong = total - correct;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      wrong,
      score
    };
  }

  /**
   * Menentukan predikat & badge kartu sesuai aturan plan.txt:
   * - Nilai > 90: Jomok Sejati (Badge Card dengan nama)
   * - Nilai 60 - 89: Jomok Medium
   * - Nilai 0 - 59: Suki Liar
   * @returns {Object} Informasi grade lengkap
   */
  getGradeInfo() {
    const { score } = this.getStatistics();

    if (score > 90) {
      return {
        tier: 'sejati',
        themeClass: 'theme-jomok-sejati',
        badgeTitle: 'JOMOK SEJATI',
        icon: 'workspace_premium',
        ribbonText: 'Sertifikasi Resmi Ngawi Empire',
        message: 'Selamat! Pengetahuan anda tentang dunia jmk telah mencapai level paripurna. Keaslian identitas anda teruji bebas dari anasir suki liar.'
      };
    } else if (score >= 60) {
      return {
        tier: 'medium',
        themeClass: 'theme-jomok-medium',
        badgeTitle: 'JOMOK MEDIUM',
        icon: 'military_tech',
        ribbonText: 'Tingkat Menengah',
        message: 'Anda adalah jomok medium. Teruslah mengasah keilmuan anda tentang jmk agar tidak lengah di hadapan suki.'
      };
    } else {
      return {
        tier: 'suki',
        themeClass: 'theme-suki-liar',
        badgeTitle: 'SUKI LIAR TERDETEKSI',
        icon: 'dangerous',
        ribbonText: 'Status Bahaya / Karantina',
        message: 'Anda adalah suki! Terdeteksi kau adalah suki liar. Jangan pernah muncul di sini lagi!'
      };
    }
  }

  /**
   * Reset seluruh sesi kuis
   */
  reset() {
    this.currentIndex = 0;
    this.userAnswers = [];
  }
}
