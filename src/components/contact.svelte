<script lang="ts">
  import PocketBase from "pocketbase";
  import { POCKETBASE_URL } from "../config";

  let submitting = false;
  let human = false;
  let status: "idle" | "success" | "error" = "idle";
  let feedback = "";

  const data = {
    name: "",
    email: "",
    message: "",
    phone: "",
    bot: true,
  };

  async function submit() {
    submitting = true;
    status = "idle";
    feedback = "";
    data.bot = !human;

    try {
      const pb = new PocketBase(POCKETBASE_URL);
      await pb.collection("messages").create(data);
      status = "success";
      feedback = "It worked. Somehow. I’ll get back to you eventually.";
      data.name = "";
      data.email = "";
      data.phone = "";
      data.message = "";
      human = false;
    } catch (error) {
      console.error("Could not send contact message", error);
      status = "error";
      feedback = "The void rejected it. Try again in a moment.";
    } finally {
      submitting = false;
    }
  }
</script>

<section class="contact-card" aria-labelledby="contact-title">
  <div class="contact-intro">
    <span class="contact-kicker" lang="ja">お問い合わせ</span>
    <h2 id="contact-title">Send something, probably</h2>
    <p>
      You can use this form to contact me about potential commissions, vague
      ideas, or whatever else seemed important five minutes ago.
    </p>
    <span class="contact-note">RESPONSE TIME // EVENTUALLY</span>
  </div>

  <form id="contact" on:submit|preventDefault={submit}>
    <fieldset disabled={submitting}>
      <div class="field-grid">
        <label>
          <span>Name <b aria-hidden="true">*</b></span>
          <input
            type="text"
            name="name"
            required
            minlength="2"
            maxlength="100"
            autocomplete="name"
            placeholder="Your name"
            bind:value={data.name}
          />
        </label>

        <label>
          <span>Email <b aria-hidden="true">*</b></span>
          <input
            type="email"
            name="email"
            required
            maxlength="200"
            autocomplete="email"
            inputmode="email"
            placeholder="I will probably share your email"
            bind:value={data.email}
          />
        </label>
      </div>

      <label>
        <span>Phone <small>optional</small></span>
        <input
          type="tel"
          name="phone"
          maxlength="40"
          autocomplete="tel"
          inputmode="tel"
          placeholder="Pizza contact number"
          bind:value={data.phone}
        />
      </label>

      <label>
        <span>Message <b aria-hidden="true">*</b></span>
        <textarea
          name="message"
          required
          minlength="10"
          maxlength="4000"
          rows="6"
          placeholder="Message content idk"
          bind:value={data.message}
        ></textarea>
      </label>

      <div class="form-actions">
        <label class="human-check">
          <input type="checkbox" required bind:checked={human} />
          <span>I am definitely not a bot</span>
        </label>
        <button type="submit" class="btn btn-primary" disabled={submitting}>
          {submitting ? "Transmitting…" : "Submit into void →"}
        </button>
      </div>
    </fieldset>

    <p
      class:success={status === "success"}
      class:error={status === "error"}
      class="form-feedback"
      role="status"
      aria-live="polite"
    >
      {feedback}
    </p>
  </form>
</section>

<style>
  .contact-card {
    display: grid;
    grid-template-columns: minmax(12rem, 0.7fr) minmax(0, 1.3fr);
    gap: clamp(1.5rem, 5vw, 3.5rem);
    margin: 3rem 0 1rem;
    padding: clamp(1.25rem, 4vw, 2.25rem);
    border: 1px solid var(--ui-line-bright);
    background: rgb(var(--ui-surface-rgb) / 0.94);
    box-shadow: 0 18px 50px rgb(0 0 0 / 0.24);
  }

  .contact-intro {
    position: relative;
    padding-left: 1rem;
    border-left: 2px solid var(--ui-cyan);
  }

  .contact-kicker,
  .contact-note,
  label > span {
    font-family: var(--ui-font-mono);
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .contact-kicker {
    color: var(--ui-cyan);
    font-family: "Noto Sans JP", var(--ui-font-sans);
    font-size: 0.75rem;
  }

  h2 {
    margin: 0.55rem 0 0.75rem;
    font-size: clamp(1.45rem, 4vw, 2rem);
    line-height: 1.1;
  }

  .contact-intro p {
    color: var(--ui-muted);
    font-size: 0.92rem;
  }

  .contact-note {
    display: block;
    margin-top: 1.5rem;
    color: var(--ui-green);
    font-size: 0.7rem;
  }

  fieldset {
    display: grid;
    gap: 1rem;
    min-width: 0;
    padding: 0;
    border: 0;
  }

  .field-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label:not(.human-check) {
    display: grid;
    gap: 0.4rem;
  }

  label > span {
    color: var(--ui-muted);
    font-size: 0.72rem;
  }

  label b {
    color: var(--ui-magenta);
  }

  label small {
    color: var(--ui-line-bright);
    font-size: inherit;
  }

  input:not([type="checkbox"]),
  textarea {
    width: 100%;
    min-height: 2.8rem;
    padding: 0.7rem 0.8rem;
  }

  textarea {
    min-height: 8.5rem;
    resize: vertical;
  }

  .form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .human-check {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    cursor: pointer;
  }

  .human-check input {
    width: 1rem;
    height: 1rem;
    accent-color: var(--ui-cyan);
  }

  .form-feedback {
    min-height: 1.5em;
    margin: 0.8rem 0 0;
    color: var(--ui-muted);
    font-family: var(--ui-font-mono);
    font-size: 0.78rem;
  }

  .form-feedback.success { color: var(--ui-green); }
  .form-feedback.error { color: var(--ui-magenta); }

  @media (max-width: 640px) {
    .contact-card,
    .field-grid {
      grid-template-columns: 1fr;
    }

    .form-actions {
      align-items: stretch;
      flex-direction: column;
    }

    .btn { width: 100%; }
  }
</style>
