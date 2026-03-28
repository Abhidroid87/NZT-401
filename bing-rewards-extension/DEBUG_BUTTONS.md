# Debug: Finding +5 Buttons on Bing Rewards

If the extension isn't clicking the +5 buttons, use this to debug:

## Step 1: Open DevTools
1. Go to https://rewards.bing.com
2. Press **F12** to open DevTools
3. Click **Console** tab

## Step 2: Run This Debug Script

Copy and paste this into the console and press Enter:

```javascript
console.log("🔎 SEARCHING FOR +5 BUTTONS...\n");

// Find all elements with "+5" text
const allElems = document.querySelectorAll("*");
let found = [];

allElems.forEach(elem => {
  if (elem.textContent.includes('+5') && elem.textContent.length < 500) {
    found.push({
      tag: elem.tagName,
      class: elem.className,
      text: elem.textContent.substring(0, 50),
      visible: elem.offsetParent !== null,
      element: elem
    });
  }
});

console.log(`Found ${found.length} elements with "+5":\n`);
found.forEach((item, i) => {
  console.log(`[${i+1}] <${item.tag} class="${item.class}">`);
  console.log(`    Text: "${item.text}"`);
  console.log(`    Visible: ${item.visible}`);
  console.log(`    Parent: ${item.element.parentElement.tagName}.${item.element.parentElement.className}`);
  console.log();
});

// Find clickable elements
console.log("\n🖱️  CLICKABLE +5 ELEMENTS:\n");
found.forEach((item, i) => {
  const elem = item.element;
  const isClickable = 
    elem.tagName === 'BUTTON' ||
    elem.tagName === 'A' ||
    elem.tagName === 'DIV' ||
    elem.tagName === 'SPAN' ||
    elem.getAttribute('role') === 'button' ||
    elem.onclick !== null ||
    elem.className.includes('button') ||
    elem.className.includes('click') ||
    elem.className.includes('item') ||
    elem.className.includes('card');
  
  const parent = elem.parentElement;
  const parentClickable = 
    parent.tagName === 'BUTTON' ||
    parent.tagName === 'A' ||
    parent.tagName === 'DIV' ||
    parent.getAttribute('role') === 'button' ||
    parent.onclick !== null ||
    parent.className.includes('button') ||
    parent.className.includes('click');
  
  if (isClickable) {
    console.log(`✅ Element itself is clickable: <${elem.tagName}>`);
  } else if (parentClickable) {
    console.log(`✅ Parent is clickable: <${parent.tagName}>`);
  } else {
    console.log(`❌ Element not clickable (parent also not clickable)`);
    console.log(`    Element: <${elem.tagName}>`);
    console.log(`    Parent: <${parent.tagName}>`);
    console.log(`    Grandparent: <${parent.parentElement.tagName}>`);
  }
});
```

## Step 3: Read the Output

The console will show:
1. **How many +5 elements are found**
2. **Each element's tag, class, and text**
3. **Which ones are clickable** (✅ or ❌)
4. **Parent/grandparent structure**

## Step 4: Share the Output

Copy the console output and share it. That will tell us:
- If +5 buttons ARE found (sometimes they're not loaded yet)
- What HTML structure they have
- Why they might not be clickable

## Common Issues

| Issue | Solution |
|-------|----------|
| Found 0 elements | Page not loaded, scroll to Activities |
| Found but not clickable | Check the parent/grandparent structure |
| Found and clickable but not clicked | Button event not working, might need different event type |

## If Extension Still Doesn't Work

Try this in console after running extension:

```javascript
// Manually click all +5 buttons
const buttons = document.querySelectorAll("[class*='card'], [class*='item']");
buttons.forEach(btn => {
  if (btn.textContent.includes('+5')) {
    console.log("Clicking:", btn.textContent.substring(0, 30));
    btn.click();
  }
});
```

This will help identify if the buttons are actually clickable or if we need a different approach.
