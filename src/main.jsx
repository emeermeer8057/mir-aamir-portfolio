import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./react-overrides.css";

const legacyScripts = [
  "/js/modernizr.js",
  "/js/jquery.min.js",
  "/js/popper.min.js",
  "/js/bootstrap.min.js",
  "/js/macy.min.js",
  "/js/page-transition.min.js",
  "/js/jquery.animatedheadline.js",
  "/js/owl.carousel.min.js",
  "/js/fitty.min.js",
  "/js/isotope.pkgd.min.js",
  "/js/modulo-columns.js",
  "/js/jquery.magnific-popup.min.js",
  "/js/simplebar.min.js",
  "/js/tilt.jquery.min.js",
  "/js/jquery.vide.min.js",
  "/js/jquery.superslides.min.js",
  "/js/particles.min.js",
  "/js/jquery.mb.YTPlayer.min.js",
  "/js/main.js",
  "/js/main-demo.js"
];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-legacy="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.legacy = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function App() {
  const [markup, setMarkup] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const response = await fetch("/original-body.html");
      const bodyHtml = await response.text();
      if (cancelled) return;

      setMarkup(bodyHtml);

      // Wait one paint so the exact original DOM exists before legacy plugins initialize.
      requestAnimationFrame(async () => {
        try {
          for (const src of legacyScripts) {
            await loadScript(src);
          }

          // The original template puts its preloader logic inside $(window).on("load").
          // In this React conversion the legacy script is injected after the browser load
          // event has already happened, so that handler would never fire. Run the exact
          // preloader actions here once the original scripts are ready.
          const $ = window.jQuery;
          if ($) {
            $(".loader").stop(true, true).fadeOut();
            $(".preloader").stop(true, true).delay(1000).fadeOut();

            // main.js also contains a window-load portfolio initializer. Re-run the
            // relevant initialization now that the original DOM exists.
            if ($(".portfolio-items").length && $.fn.isotope) {
              $(".portfolio-items").isotope();
            }

            // Ensure the original page-transition system has initialized after all
            // legacy dependencies are present.
            if (window.PageTransitions && typeof window.PageTransitions.init === "function") {
              window.PageTransitions.init();
            }

            $("#contact-form").off("submit").on("submit", async function (e) {
              e.preventDefault();

              const form = this;
              const name = $("#cf-name").val().trim();
              const email = $("#cf-email").val().trim();
              const message = $("#cf-message").val().trim();
              const alertContainer = $("#contact-form .alert-container");

              $(".cf-validate", form).removeClass("cf-error");

              let valid = true;
              if (!name) { $("#cf-name").addClass("cf-error"); valid = false; }
              if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
                $("#cf-email").addClass("cf-error"); valid = false;
              }
              if (!message) { $("#cf-message").addClass("cf-error"); valid = false; }

              if (!valid) return;

              const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;

              if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
                const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
                const body = encodeURIComponent(`Name: ${name}\\nEmail: ${email}\\n\\n${message}`);
                window.location.href =
                  `mailto:aamirshowkatmir@gmail.com?subject=${subject}&body=${body}`;
                return;
              }

              $("#cf-submit").prop("disabled", true).text("Sending...");

              try {
                const result = await fetch(endpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                  },
                  body: JSON.stringify({ name, email, message })
                });

                if (!result.ok) throw new Error("Unable to send");

                alertContainer
                  .html('<div class="alert alert-success">Thanks! Your message has been sent.</div>')
                  .fadeIn(300).delay(4000).fadeOut(400);

                form.reset();
                $(".input__field", form).each(function () {
                  $(this).parent(".input").removeClass("input--filled");
                });
              } catch (error) {
                alertContainer
                  .html('<div class="alert alert-danger">Unable to send the message right now. Please email me directly.</div>')
                  .fadeIn(300).delay(4000).fadeOut(400);
              } finally {
                $("#cf-submit").prop("disabled", false).text("Send Message");
              }
            });
          }

          setReady(true);
        } catch (error) {
          console.error(error);
          setReady(true);
        }
      });
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div id="legacy-site" dangerouslySetInnerHTML={{ __html: markup }} />
      {!ready && (
        <div className="react-boot-overlay">
          <div className="react-boot-loader">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
