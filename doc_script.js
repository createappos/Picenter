document.addEventListener('DOMContentLoaded', () => {
    // Assuming your form has an ID of 'upload-form'
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) {
        console.error('Upload form with ID "upload-form" not found.');
        return;
    }

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const submitButton = uploadForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Saving...';

        // Assuming your form inputs have these IDs
        const projectName = document.getElementById('project-title').value;
        const language = document.getElementById('language').value;
        const code = document.getElementById('code-content').value;

        // IMPORTANT: Replace this with the public URL of your deployed backend server
        const backendUrl = 'https://your-actual-backend-url.onrender.com'; // <-- ⚠️ UPDATE THIS WITH YOUR REAL URL

        try {
            const response = await fetch(`${backendUrl}/api/save-to-github`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectName, language, code }),
            });

            if (!response.ok) {
                let errorMessage = `Request failed with status: ${response.status}`;
                try {
                    // Try to parse a JSON error response from the server
                    const errorData = await response.json();
                    errorMessage = errorData.message || 'Failed to save to GitHub';
                } catch (e) {
                    // If the response isn't JSON, use the raw text. This prevents the "Unexpected token" error.
                    const errorText = await response.text();
                    console.error("Received non-JSON error response:", errorText);
                }
                throw new Error(errorMessage);
            }

            // Success! Show a success message and redirect.
            submitButton.innerHTML = '<i class="fa-solid fa-check"></i> Success!';
            
            setTimeout(() => {
                window.location.href = 'project.html'; // Redirect to the projects page
            }, 1500); // Wait 1.5s before redirecting

        } catch (error) {
            // On error, re-enable the button and show the error.
            let userMessage = `An error occurred: ${error.message}`;
            // Provide a more helpful message for the common "Failed to fetch" error.
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                userMessage = 'Network Error: Could not connect to the server. Please ensure the backend URL is correct and the server is running.';
            }
            console.error('Error saving project:', error); // Keep detailed error in console
            alert(userMessage); // Show user-friendly message

            // Reset the button state only on failure
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});