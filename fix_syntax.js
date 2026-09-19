const fs = require('fs');
let code = fs.readFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', 'utf8');

// I left a div open because the regex started after the `<div ...>`
// Let's find exactly where the error is by parsing or just adding `</div>` right after the grid.
// Wait! The grid replaces the `<label...` and `textarea`. But wait!
// The original code was:
// <div>
//   <label>...</label>
//   <textarea></textarea>
// </div>
//
// My replacement put:
// <div className="grid...">...</div>
//
// So it became:
// <div>
//   <div className="grid...">...</div>
//   <div className="pt-4 flex...">...</div>
// </div>
// Wait, then where did the syntax error come from?
// The syntax error is: "Unexpected token. Did you mean `{'}'}` or `&rbrace;`?"
// Because there is an EXTRA `</div>` or missing one?
// Wait, my replacement had:
// `<div className="grid...">...</div> <div className="pt-4...">...</div>`
// BUT it replaced `</label>... Confirm Cancel</button> </div>`
// So it replaced the `</div>` that closed the `pt-4` div!
// But wait, my replacement INCLUDED the closing `</div>` of the `pt-4` div?
// Let's look at my replacement:
// `<div className="pt-4 flex justify-end gap-3"> ... Confirm Cancel</button> </div>`
// Yes, it has the closing `</div>`!

// Wait! If the original had:
// <div>
//   <label>...</label>
//   <textarea>...</textarea>
// </div>
// <div className="pt-4...">
//   ... Confirm Cancel</button>
// </div>
//
// And the regex was from `<label` to `Confirm Cancel</button>\s*</div>`
// Then it replaced:
// 1. `<label>...</label>`
// 2. `<textarea>...</textarea>`
// 3. `</div>` (the one closing the textarea div!)
// 4. `<div className="pt-4...">`
// 5. `<button>...</button>`
// 6. `<button>Confirm Cancel</button>`
// 7. `</div>` (the one closing the pt-4 div!)

// So the replacement string was inserted INSIDE the `<div>` that originally wrapped the textarea!
// So it became:
// <div>
//   <div className="grid...">...</div>
//   <div className="pt-4...">...</div>
// 
// And then what comes after?
//               </div>
//             </div>
//           </div>
//         )}
// Wait, if it ate the `</div>` that closed the `pt-4` div AND the `</div>` that closed the textarea div,
// then the wrapper `<div>` is NEVER CLOSED!

code = code.replace(
    `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">`,
    `</div>\n                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`
);
fs.writeFileSync('src/components/enrollments/StudentDatabaseFilter.tsx', code);
