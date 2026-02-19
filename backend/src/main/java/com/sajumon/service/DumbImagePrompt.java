package com.sajumon.service;

public class DumbImagePrompt {
    public static final String TEMPLATE = """
        ABSOLUTE PRIORITY (TOP PRIORITY – READ FIRST):
        Stupidity, imbalance, and wrongness come FIRST.
        
        This drawing must look DUMB, CARELESS, and MEANINGLESS.
        It must NOT show effort, intention, skill, control, or style.
        
        If the image looks:
        – expressive
        – stylized
        – intentionally messy
        – cute
        – balanced
        – thoughtfully drawn
        – artistically crude
        it is INVALID.
        
        This must look like a person who:
        – does not know how to draw
        – does not understand shapes or space
        – does not understand proportion
        – does not care if the drawing looks wrong
        – finishes the drawing without thinking
        
        Single Chinese zodiac animal: %s.
        
        (Allowed animals ONLY:
        Rat, Ox, Tiger, Rabbit, Dragon, Snake,
        Horse, Goat, Monkey, Rooster, Dog, Pig)
        
        Generate EXACTLY ONE animal.
        Do NOT generate multiple animals.
        Do NOT generate any animal outside this list.
        
        Pure white background.
        1:1 aspect ratio.
        
        GLOBAL STYLE:
        Extremely dumb MS Paint doodle.
        Looks like a meaningless scribble made with a mouse.
        
        Not stylized.
        Not expressive.
        Not exaggerated for effect.
        
        No sense of balance.
        No sense of proportion.
        No sense of symmetry.
        No sense of composition.
        
        Drawn without zooming.
        No undo.
        No erasing.
        No fixing.
        No improvement attempts.
        
        IMAGE QUALITY:
        VERY VERY LOW resolution bitmap image.
        Looks like it was drawn on a tiny canvas
        and badly upscaled.
        Blocky pixels.
        Jagged edges.
        Poor clarity.
        Overall image quality must feel careless.
        
        LINE STYLE (CRITICAL):
        – MS Paint default 1px brush ONLY
        – Thin, plain black lines
        – No expressive shakiness
        – No intentional wobble
        – Lines feel dull and uncontrolled
        – Lines often fail to connect
        – Random gaps between strokes
        – Some lines feel unnecessary or misplaced
        – Curves are awkward or broken
        – NO anti-aliasing
        – NO bold lines
        
        ABSOLUTELY NOT vector-style.
        ABSOLUTELY NOT clean digital lineart.
        
        ANIMAL BODY STYLE (VERY IMPORTANT):
        – Simple blob-like shape
        – Proportions are wrong without intention
        – Body parts do not match in size or logic
        – Head, wings, legs, and body feel unrelated
        – Attachment points feel unclear or incorrect
        – Some parts may look incomplete or poorly drawn
        – No anatomy logic
        – No realism
        
        Face:
        – Dot eyes only
        – Uneven placement
        – Mouth is a single straight or slightly curved line
        – Blank, empty, unintelligent expression
        
        COLOR RULE (CRITICAL):
        – The animal body is STRICTLY black and white
        – NO color fill on the animal
        – NO gray
        – NO shading
        – NO texture
        – Only pure black lines on white background
        
        THEME: %s
        THEME OBJECT: %s
        
        IF THEME is NOT "career":
        – The [animal] is holding ONE [THEME OBJECT] in its mouth
        – The [THEME OBJECT] is awkwardly placed
        – Not centered
        – Not aligned
        – Looks uncomfortable or wrong
        
        THEME OBJECT COLORING (VERY IMPORTANT):
        – [THEME OBJECT] is ONE flat solid color ONLY
        – NO shading
        – NO gradient
        – NO highlights
        – NO brush texture
        – NO painterly strokes
        
        Color application rules:
        – Single careless fill action
        – Uneven coverage
        – Visible empty gaps
        – Some color spills outside the outline
        – No correction
        – No second pass
        – Looks like coloring was done once and abandoned
        
        ABSOLUTE RULE:
        NO other objects.
        NO symbols.
        NO decorations.
        NO background elements.
        ONLY the animal and the [THEME OBJECT].
        
        LAYOUT:
        Flat front view.
        Awkward spacing.
        Unbalanced composition.
        No depth.
        No lighting.
        No shadows.
        No texture.
        
        NEGATIVE PROMPT:
        expressive lines, stylized messiness, intentional ugliness, painterly strokes, brush texture, shading, gradients, soft edges, clean fills, even coloring, symmetry, balanced anatomy, complete or matching limbs, polished shapes, cute style, illustration style, professional drawing, vector art, anti-aliasing, anime, manga, lighting effects, text, speech bubbles, frames, borders
        """;
}