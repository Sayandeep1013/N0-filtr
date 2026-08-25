'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { IconCircle } from '@/components/ui/IconCircle';
import { CONTACT, SERVICES, TALLY_FORM_ID } from '@/lib/content/site';
import { cx } from '@/lib/cx';
import s from './ContactForm.module.css';

/**
 * The contact form — docs/spec/20-components-and-motion.md §3.
 *
 * tonik embeds Tally. We render a **styled native fallback** that matches it
 * field for field, and hand over to Tally the moment `NEXT_PUBLIC_TALLY_FORM_ID`
 * is set. T1.8's acceptance is precisely that it renders without one.
 *
 * With no form ID and no endpoint there is nowhere to POST, so submit composes a
 * `mailto:` to the business address instead. That is a real working path rather
 * than a stub, and it is what phase 12 replaces when the site goes live. See
 * I-015 — the budget bands and the referral options are placeholders too; the
 * spec gives the field a chip count but no chips.
 */

/** Placeholder — the spec names "WHAT BUDGET DO YOU HAVE?" but no bands. I-015. */
const BUDGETS = ['Under $5k', '$5k – $15k', '$15k – $50k', '$50k+', 'Not sure yet'];

/** Placeholder — the spec says "chip multi-select ×4" and names none. I-015. */
const SOURCES = ['Search', 'Social', 'Referral', 'GitHub'];

function useToggleSet() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  return [selected, toggle] as const;
}

function Chips({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className={s.field}>
      <legend data-t="label" className={s.legend}>
        {legend}
      </legend>
      <div className={s.chips}>
        {options.map((option) => {
          const on = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={cx(s.chip, on && s.chipOn, 'check-box')}
              aria-pressed={on}
              onClick={() => onToggle(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ContactForm() {
  const [services, toggleService] = useToggleSet();
  const [sources, toggleSource] = useToggleSet();

  if (TALLY_FORM_ID) {
    return (
      <iframe
        className={s.tally}
        src={`https://tally.so/embed/${TALLY_FORM_ID}?alignLeft=1&hideTitle=1&transparentBackground=1`}
        title="Contact form"
        loading="lazy"
      />
    );
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      `Name: ${data.get('name') ?? ''}`,
      `Company: ${data.get('company') ?? ''}`,
      `Email: ${data.get('email') ?? ''}`,
      `Services: ${services.join(', ')}`,
      `Budget: ${data.get('budget') ?? ''}`,
      `Found us via: ${sources.join(', ')}`,
      '',
      String(data.get('project') ?? ''),
    ];
    const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(
      'Project enquiry',
    )}&body=${encodeURIComponent(lines.join('\n'))}`;
    window.location.href = href;
  };

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate={false}>
      <div className={s.row}>
        <div className={s.field}>
          <label data-t="label" className={s.label} htmlFor="contact-name">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            className={cx(s.input, 'form_input')}
            placeholder="Your name"
            autoComplete="name"
            required
          />
        </div>
        <div className={s.field}>
          <label data-t="label" className={s.label} htmlFor="contact-company">
            Company
          </label>
          <input
            id="contact-company"
            name="company"
            className={cx(s.input, 'form_input')}
            placeholder="Company"
            autoComplete="organization"
          />
        </div>
      </div>

      <div className={s.field}>
        <label data-t="label" className={s.label} htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          className={cx(s.input, 'form_input')}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />
      </div>

      <Chips
        legend="How can we help you?"
        options={SERVICES.map((service) => service.name)}
        selected={services}
        onToggle={toggleService}
      />

      <div className={s.field}>
        <label data-t="label" className={s.label} htmlFor="contact-project">
          Tell us about your project
        </label>
        <textarea
          id="contact-project"
          name="project"
          className={cx(s.textarea, 'form_input')}
          placeholder="What are you building?"
          required
        />
      </div>

      <div className={s.field}>
        <label data-t="label" className={s.label} htmlFor="contact-budget">
          What budget do you have?
        </label>
        <div className={s.selectWrap}>
          <select id="contact-budget" name="budget" className={cx(s.select, 'form_input')} defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            {BUDGETS.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
          <svg className={s.chevron} viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
            <path d="M2 4.5L6 8.5l4-4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <Chips
        legend="Where did you find us?"
        options={SOURCES}
        selected={sources}
        onToggle={toggleSource}
      />

      <button type="submit" className={s.submit}>
        <span>Submit a form</span>
        <IconCircle />
      </button>
    </form>
  );
}
