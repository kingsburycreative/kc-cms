import { callout, checkItWorked, chip, figure, steps } from "../parts.ts";

export const title = "Photo galleries";
export const group = "modules";
export const slug = "module-galleries";
export const moduleId = "galleries";
// The date this page was last checked against the CMS. A recheck changes this one line.
export const checked = "2026-11-17";
// Stays out of the guide until Rob has read the page and approved it.
export const approved = false;
export const goal = "You will add a photo to the right category in your gallery.";
export const time = "About 3 minutes";
export const body = `<p>The gallery on your site is built from photos you add one at a time. Photos are sorted into categories, such as Interlock, Deck, Fence and Renovation. Each category has its own list in the menu.</p>
${steps([
  {
    action: `Open the category the photo belongs in, for example ${chip("Deck photos")}.`,
    see: "The list of photos in that category.",
    ifNot: "If the category isn't in the menu, your site doesn't have it. Email Kingsbury Creative.",
  },
  {
    action: `Choose ${chip("Add an entry")}.`,
    figure: figure({ caption: "The Deck photos list with Add an entry highlighted." }),
    see: "A blank photo form.",
    ifNot: "If the button is missing, open the category's list rather than a single page.",
  },
  {
    action: `In ${chip("Photo")}, choose ${chip("Upload")}, or choose ${chip("Select")} for a picture you already uploaded.`,
    see: "The picture's name in the box.",
    ifNot: "Use a jpg, png or webp picture.",
  },
  {
    action: `Describe the picture in ${chip("Photo description")}. If your site has a French version, fill in ${chip("Photo description (French)")} too.`,
    see: "Your words in both boxes.",
    ifNot: "The CMS won't save a photo without a description. A red box means a description is missing.",
  },
  {
    action: `Pick the matching ${chip("Service")}, then choose ${chip("Save")}.`,
    figure: figure({ caption: "The filled-in photo form with Service and Save." }),
    see: "The photo saved and shown in the category's list.",
    ifNot: "If a box is red, fix it first.",
  },
])}
${callout("note", "The description is read aloud to visitors who cannot see the photo, and search engines read it too. Say what is in the picture, for example <em>Grey interlock driveway with a curved edge</em>. Don't start with image of or photo of.")}
<h2>Move or remove a photo</h2>
<p>To move a photo to another category, add it again there and delete the old entry. To remove a photo, open it and choose ${chip("Delete")}. The picture file stays in Media until you delete it there.</p>
${figure({ caption: "A photo entry with the Delete button in the three-dot menu." })}
${checkItWorked("After a minute, open the gallery on your live site. The photo is in the right category and its description is right.")}`;
