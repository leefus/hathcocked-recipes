"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createRecipe } from "@/app/add/actions";

const PASSCODE_KEY = "hathcocked-passcode";

// Phone photos run 3–8 MB; a recipe photo never needs to be bigger than this.
const MAX_EDGE = 1600;

const field =
  "w-full rounded-md border border-hairline bg-card px-4 py-3 text-body-md text-ink placeholder:text-muted/70 focus:border-primary focus:shadow-focus focus:outline-none";

/** Shrink to MAX_EDGE as a JPEG. Falls back to the original if the browser can't decode it. */
async function shrinkPhoto(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    if (!blob) return file;
    const name = (file.name || "photo").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function Label({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-label-lg font-semibold text-ink">{children}</span>
      {hint && <span className="ml-2 text-label-md text-muted">{hint}</span>}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="surface-1 space-y-5 rounded-lg p-5 sm:p-6">
      <h2 className="font-serif text-headline-sm font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default function AddRecipeForm({ categories, tags, difficulties }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [picked, setPicked] = useState([]);
  const [preview, setPreview] = useState(null);
  const [passcode, setPasscode] = useState("");
  const photoRef = useRef(null);
  const errorRef = useRef(null);

  // Remember the passcode on this device so it's typed once, not per recipe.
  useEffect(() => {
    try {
      setPasscode(localStorage.getItem(PASSCODE_KEY) ?? "");
    } catch {}
  }, []);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  const toggleTag = (t) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const clearPhoto = () => {
    if (photoRef.current) photoRef.current.value = "";
    setPreview(null);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const photo = fd.get("photo");
      if (photo instanceof File && photo.size > 0) {
        fd.set("photo", await shrinkPhoto(photo));
      } else {
        fd.delete("photo");
      }

      let res;
      try {
        res = await createRecipe(fd);
      } catch {
        res = { error: "Couldn't reach the site. Check your connection and try again." };
      }

      if (res?.error) {
        setError(res.error);
        return;
      }
      try {
        localStorage.setItem(PASSCODE_KEY, String(fd.get("passcode") ?? ""));
      } catch {}
      router.push(`/recipes/${res.slug}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <Section title="The recipe">
        <div className="space-y-2">
          <Label htmlFor="title">Name</Label>
          <input id="title" name="title" required maxLength={200} className={field}
            placeholder="Grandma's Buttermilk Pie" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" name="category" required defaultValue="" className={field}>
              <option value="" disabled>Choose one</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty" hint="optional">Difficulty</Label>
            <select id="difficulty" name="difficulty" defaultValue="" className={field}>
              <option value="">—</option>
              {difficulties.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="submittedBy" hint="who's sharing it">Submitted by</Label>
            <input id="submittedBy" name="submittedBy" maxLength={120} className={field}
              autoComplete="name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source" hint="optional">Source</Label>
            <input id="source" name="source" maxLength={200} className={field}
              placeholder="Church cookbook, 1978" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" hint="optional">Description</Label>
          <textarea id="description" name="description" rows={2} maxLength={2000} className={field}
            placeholder="A line or two about the dish." />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5">
          {[
            ["servings", "Serves"],
            ["prepMinutes", "Prep min"],
            ["cookMinutes", "Cook min"],
          ].map(([name, label]) => (
            <div key={name} className="space-y-2">
              <Label htmlFor={name}>{label}</Label>
              <input id={name} name={name} type="number" inputMode="numeric" min="0" step="any"
                className={`${field} tnum`} />
            </div>
          ))}
        </div>

        {tags.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-label-lg font-semibold text-ink">Tags</legend>
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((t) => {
                const on = picked.includes(t);
                return (
                  <label key={t}
                    className={`cursor-pointer rounded px-3 py-1.5 text-label-md font-semibold transition-colors ${
                      on ? "bg-sage text-white" : "bg-sage/[0.12] text-sage-ink hover:bg-sage/20"
                    }`}
                  >
                    <input type="checkbox" name="tags" value={t} checked={on}
                      onChange={() => toggleTag(t)} className="sr-only" />
                    {t}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </Section>

      <Section title="Ingredients">
        <div className="space-y-2">
          <Label htmlFor="ingredients" hint="one per line">Ingredients</Label>
          <textarea id="ingredients" name="ingredients" required rows={8} className={`${field} tnum`}
            placeholder={"1½ c. sugar\n3 eggs\n1 stick butter, melted"} />
          <p className="text-label-md text-muted">
            Start a line with the amount and the site can scale it.
          </p>
        </div>
      </Section>

      <Section title="Directions">
        <div className="space-y-2">
          <Label htmlFor="steps" hint="one step per line">Steps</Label>
          <textarea id="steps" name="steps" required rows={8} className={field}
            placeholder={"Preheat oven to 350°.\nMix sugar and eggs.\nBake 45 minutes."} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes" hint="optional">Notes from the card</Label>
          <textarea id="notes" name="notes" rows={3} maxLength={2000}
            className={`${field} font-serif italic`}
            placeholder="Double it for Thanksgiving." />
        </div>
      </Section>

      <Section title="Photo">
        {preview ? (
          <div className="relative overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected recipe photo" className="aspect-[4/3] w-full object-cover" />
            <button type="button" onClick={clearPhoto} aria-label="Remove photo"
              className="tap absolute right-3 top-3 grid place-items-center rounded-full border border-hairline bg-card/90 backdrop-blur">
              <X className="h-5 w-5 text-ink" strokeWidth={2.2} />
            </button>
          </div>
        ) : (
          <label htmlFor="photo"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-hairline-strong bg-marginalia px-4 py-10 text-center hover:border-primary">
            <ImagePlus className="h-7 w-7 text-muted" strokeWidth={1.8} />
            <span className="text-label-lg font-semibold text-ink">Add a photo</span>
            <span className="text-label-md text-muted">Optional. A picture of the dish or the card.</span>
          </label>
        )}
        <input ref={photoRef} id="photo" name="photo" type="file" accept="image/*"
          onChange={onPhoto} className="sr-only" />
      </Section>

      <Section title="Family passcode">
        <div className="space-y-2">
          <Label htmlFor="passcode">Passcode</Label>
          <input id="passcode" name="passcode" type="password" required autoComplete="off"
            value={passcode} onChange={(e) => setPasscode(e.target.value)} className={field} />
          <p className="text-label-md text-muted">
            Keeps strangers out of the book. This device will remember it.
          </p>
        </div>
      </Section>

      {error && (
        <p ref={errorRef} role="alert"
          className="rounded-md border-l-4 border-primary bg-primary-tint p-4 text-body-md text-primary-deep">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending}
        className="tap flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-label-lg font-semibold text-white shadow-e1 transition-transform active:scale-[0.98] disabled:opacity-70">
        {pending && <Loader2 className="h-[18px] w-[18px] animate-spin" strokeWidth={2.2} />}
        {pending ? "Saving to the book…" : "Add to the book"}
      </button>
    </form>
  );
}
