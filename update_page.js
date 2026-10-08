const fs = require('fs')
let content = fs.readFileSync('src/app/dashboard/faculty/batches/page.tsx', 'utf8')

const target = `    let query = supabase
      .from('batches')
      .select(\`
        id,
        batch_name,
        status,
        start_time,
        end_time,
        schedule_days,
        courses ( name, family ),
        rooms ( name ),
        profiles!batches_teacher_id_fkey ( display_name ),
        class_sessions ( class_number )
      \`)`

const replacement = `    let query = supabase
      .from('batches')
      .select(\`
        id,
        batch_name,
        status,
        start_time,
        end_time,
        schedule_days,
        total_classes,
        additional_classes,
        courses ( name, family ),
        rooms ( name ),
        profiles!batches_teacher_id_fkey ( display_name ),
        class_sessions ( class_number )
      \`)`

content = content.replace(target, replacement)
fs.writeFileSync('src/app/dashboard/faculty/batches/page.tsx', content)
console.log("Done updating page.tsx")
