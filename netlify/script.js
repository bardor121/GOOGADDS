document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // Secure API/Webhook Caller Function
    // This single function now handles all communication with your secure backend.
    // ============================================
    async function callSecureProxy(action, payload) {
        try {
            // =================================================================
            //                      !!! התיקון נמצא כאן !!!
            // The URL was changed to the direct Netlify function path to fix the 404 error.
            // =================================================================
            const response = await fetch('/.netlify/functions/proxy', { // The secure endpoint
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok, status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error during secure call for action "${action}":`, error);
            throw error; // Re-throw the error to be handled by the caller
        }
    }

    // ============================================
    // Gemini API Feature Logic (Process Analyzer) - NOW SECURE
    // ============================================
    const generateBtn = document.getElementById('generate-idea-btn');
    const processDescription = document.getElementById('process-description');
    const resultContainer = document.getElementById('gemini-result-container');
    const geminiLoader = document.getElementById('gemini-loader');
    const geminiResponseEl = document.getElementById('gemini-response');

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const userInput = processDescription.value;
            if (!userInput.trim()) {
                geminiResponseEl.textContent = 'אנא תארו תהליך כדי שנוכל להציע רעיון לאוטומציה.';
                resultContainer.classList.remove('hidden');
                return;
            }

            resultContainer.classList.remove('hidden');
            geminiLoader.style.display = 'flex';
            geminiResponseEl.textContent = '';

            try {
                const prompt = `You are an expert automation consultant... User's process: "${userInput}"`; // Your original prompt
                const result = await callSecureProxy('analyzeProcess', { prompt });
                geminiResponseEl.textContent = result.text;
            } catch (error) {
                geminiResponseEl.textContent = 'אירעה שגיאה. אנא נסו שוב מאוחר יותר.';
            } finally {
                geminiLoader.style.display = 'none';
            }
        });
    }

    // ============================================
    // Gemini API Feature Logic (ROI Calculator) - NOW SECURE
    // ============================================
    const calculateRoiBtn = document.getElementById('calculate-roi-btn');
    const roiProblem = document.getElementById('roi-problem');
    const roiHours = document.getElementById('roi-hours');
    const roiResultContainer = document.getElementById('roi-result-container');
    const roiLoader = document.getElementById('roi-loader');
    const roiResponseEl = document.getElementById('roi-response');

    if (calculateRoiBtn) {
        calculateRoiBtn.addEventListener('click', async () => {
            const problemInput = roiProblem.value;
            const hoursInput = roiHours.value;

            if (!problemInput.trim() || !hoursInput.trim()) {
                roiResponseEl.textContent = 'אנא תארו את הבעיה ומלאו את מספר השעות החודשיות.';
                roiResultContainer.classList.remove('hidden');
                return;
            }

            roiResultContainer.classList.remove('hidden');
            roiLoader.style.display = 'flex';
            roiResponseEl.textContent = '';

            try {
                const prompt = `You are an expert business automation ROI analyst... User's problem: "${problemInput}", Monthly hours wasted: ${hoursInput}`; // Your original prompt
                const result = await callSecureProxy('calculateRoi', { prompt });
                roiResponseEl.textContent = result.text;
            } catch (error) {
                roiResponseEl.textContent = 'אירעה שגיאה. אנא נסו שוב מאוחר יותר.';
            } finally {
                roiLoader.style.display = 'none';
            }
        });
    }

    // ============================================
    // n8n Webhook Form Submission Logic - NOW SECURE
    // ============================================
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        const submitBtn = document.getElementById("submit-btn");
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "שולח...";
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                await callSecureProxy('submitContactForm', { data });
                submitBtn.textContent = "✔ נשלח בהצלחה!";
                contactForm.reset();
                setTimeout(() => {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }, 3000);
            } catch (error) {
                submitBtn.textContent = "שגיאה. נסה שוב";
                submitBtn.disabled = false;
            }
        });
    }

    // ============================================
    // Coupon Popup Logic - NOW SECURE
    // ============================================
    const couponForm = document.getElementById('coupon-form');
    const successMsg = document.getElementById('success-msg');

    if (couponForm) {
        couponForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const submitButton = couponForm.querySelector('button[type="submit"]');
          const originalButtonText = submitButton.innerHTML;
          submitButton.innerHTML = 'שולח...';
          submitButton.disabled = true;

          const formData = new FormData(couponForm);
          const data = Object.fromEntries(formData.entries());

          try {
            await callSecureProxy('submitCouponForm', { data });
            successMsg.style.display = 'block';
            setTimeout(() => {
              couponForm.reset();
              document.getElementById('coupon-modal').classList.add('hidden');
              successMsg.style.display = 'none';
              submitButton.innerHTML = originalButtonText;
              submitButton.disabled = false;
            }, 3000);
          } catch (error) {
            alert('⚠️ קרתה שגיאה. נסה שוב מאוחר יותר.');
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
          }
        });
    }
    
    // All safe visual/UI logic remains unchanged (FAQ, Smooth Scroll, etc.)
    const faqContainer = document.getElementById('faq-container');
    if (faqContainer) {
        const questions = faqContainer.querySelectorAll('.faq-question');
        questions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const arrow = question.querySelector('.faq-arrow');
                const isAnswerOpen = answer.style.maxHeight && answer.style.maxHeight !== '0px';
                questions.forEach(q => {
                    if (q !== question) {
                        q.nextElementSibling.style.maxHeight = '0px';
                        q.querySelector('.faq-arrow').classList.remove('rotate-180');
                    }
                });
                if (isAnswerOpen) {
                    answer.style.maxHeight = '0px';
                    arrow.classList.remove('rotate-180');
                } else {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    arrow.classList.add('rotate-180');
                }
            });
        });
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });
    const trigger = document.getElementById('coupon-trigger');
    const modal = document.getElementById('coupon-modal');
    const closeModalBtn = document.getElementById('close-modal');
     if (trigger && modal && closeModalBtn) {
        trigger.addEventListener('click', () => modal.classList.remove('hidden'));
        closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
        window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    }
});
