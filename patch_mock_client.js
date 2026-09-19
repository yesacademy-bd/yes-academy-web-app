const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/mocks/MockClient.tsx', 'utf8');

// 1. Add states
const stateRegex = /const \[isSubmitting, setIsSubmitting\] = useState\(false\)/;
const newStates = `const [isSubmitting, setIsSubmitting] = useState(false)
  const [mockStatus, setMockStatus] = useState('Paid')
  const [isSuccess, setIsSuccess] = useState(false)`;
code = code.replace(stateRegex, newStates);

// 2. Form submission logic
const submitRegex = /const res = await createMockService\(formData\)\s*if \(res\.success\) \{\s*window\.location\.reload\(\)\s*\} else \{/m;
const newSubmit = `const res = await createMockService(formData)
      if (res.success) {
        setIsSuccess(true)
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {`;
code = code.replace(submitRegex, newSubmit);

// 3. Make the form wider
const formContainerRegex = /<div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">/;
const newFormContainer = `<div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">`;
code = code.replace(formContainerRegex, newFormContainer);

// 4. Update the form layout inside. It's currently a bunch of divs with space-y-4.
// Let's wrap the fields in a grid.
const formStartRegex = /<form action=\{handleSubmit\} className="space-y-4">/;
const newFormStart = `<form action={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
code = code.replace(formStartRegex, newFormStart);

// We need to close the grid before the button and registration by.
const regByRegex = /<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Registration By<\/label>/;
const newRegBy = `</div> <!-- End of grid -->
            
            <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration By</label>`;
code = code.replace(regByRegex, newRegBy);

// 5. Button and Success Animation
const buttonRegex = /<button type="submit" disabled=\{isSubmitting\}[\s\S]*?<\/button>/;
const newButton = `{isSuccess ? (
                <div className="w-full md:w-1/2 flex justify-end items-center p-2 animate-in fade-in zoom-in duration-500">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white mr-3 shadow-lg scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-green-600 font-bold text-lg">Booking Confirmed Successfully</span>
                </div>
              ) : (
                <div className="w-full md:w-1/2 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg">
                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </div>`;
code = code.replace(buttonRegex, newButton);

// 6. Hook mock_status into state
const mockStatusRegex = /<select name="mock_status" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">/;
const newMockStatus = `<select name="mock_status" required value={mockStatus} onChange={e => setMockStatus(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">`;
code = code.replace(mockStatusRegex, newMockStatus);

// 7. Hide payment fields when Free
const paymentFieldsRegex = /<div className="grid grid-cols-2 gap-4">\s*<div>\s*<label className="block text-sm font-medium text-gray-700 mb-1">Total Fee<\/label>[\s\S]*?<\/select>\s*<\/div>/;
const newPaymentFields = `{mockStatus === 'Paid' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Fee</label>
                    <input type="number" name="amount" defaultValue="0" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid</label>
                    <input type="number" name="paid_amount" defaultValue="0" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select name="payment_method" required className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </>
            )}`;
code = code.replace(paymentFieldsRegex, newPaymentFields);

fs.writeFileSync('src/app/dashboard/mocks/MockClient.tsx', code);
console.log('MockClient.tsx patched successfully');
