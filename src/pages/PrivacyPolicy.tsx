import { SEO } from "@/components/SEO";
import { PageContainer } from "@/components/layout/PageContainer";

const PrivacyPolicy = () => {
  return (
    <>
      <SEO 
        title="Privacy Policy - Teslys"
        description="Privacy Policy for Teslys Tesla rental and fleet management platform. Learn how we collect, use, and protect your information."
      />
      <PageContainer className="py-8">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <header>
            <h1>Privacy Policy for Teslys</h1>
            <p className="text-muted-foreground">Last updated: 01/01/2021</p>
          </header>

          <main>
            <p>
              Teslys ("we," "our," "us") operates the Teslys mobile application ("App") and website ("Service") to provide Tesla rental and fleet management solutions. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
            </p>

            <section>
              <h2>1. Information We Collect</h2>
              <ul>
                <li><strong>Personal Information:</strong> Name, email, phone number, driver's license, and payment details.</li>
                <li><strong>Vehicle Information:</strong> VIN, mileage, charging status, location data (when enabled).</li>
                <li><strong>Usage Data:</strong> App activity, logs, device type, crash reports.</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <ul>
                <li>To provide and improve the Teslys platform.</li>
                <li>To facilitate bookings, payments, and fleet management.</li>
                <li>To communicate with you about rentals, updates, and support.</li>
                <li>To comply with legal obligations and fraud prevention.</li>
              </ul>
            </section>

            <section>
              <h2>3. Sharing of Information</h2>
              <p>We do not sell your data. We may share data with:</p>
              <ul>
                <li>Service providers (e.g., payment processors, hosting services).</li>
                <li>Business partners (e.g., Tesla rental hosts, fleet managers).</li>
                <li>Legal authorities when required by law.</li>
              </ul>
            </section>

            <section>
              <h2>4. Data Security</h2>
              <p>We use encryption, secure servers, and industry-standard practices to protect your data.</p>
            </section>

            <section>
              <h2>5. Your Rights</h2>
              <p>
                You can request access, correction, or deletion of your personal data at any time. Contact us at:{" "}
                <a href="mailto:support@teslys.app" className="text-primary hover:underline">
                  support@teslys.app
                </a>
                .
              </p>
            </section>

            <section>
              <h2>6. Third-Party Services</h2>
              <p>
                Teslys may link to third-party apps (e.g., Turo, Eon). Their policies govern how they handle your data.
              </p>
            </section>

            <section>
              <h2>7. Children's Privacy</h2>
              <p>Teslys is not intended for users under 18.</p>
            </section>

            <section>
              <h2>8. Changes</h2>
              <p>We may update this policy. Updates will be posted here with a revised date.</p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                If you have questions, email us at:{" "}
                <a href="mailto:support@teslys.app" className="text-primary hover:underline">
                  support@teslys.app
                </a>
              </p>
            </section>
          </main>
        </div>
      </PageContainer>
    </>
  );
};

export default PrivacyPolicy;