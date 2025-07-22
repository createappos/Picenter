document.addEventListener('DOMContentLoaded', async () => {
    const projectGrid = document.querySelector('.project-grid');
    const searchHeader = document.getElementById('search-results-header');

    if (!projectGrid) return; // Exit if the main grid element isn't found

    let allProjects = [];
    // IMPORTANT: Replace this with the public URL of your deployed backend server
    const backendUrl = 'https://your-live-backend-url.onrender.com'; // <-- ⚠️ UPDATE THIS URL

    try {
        const response = await fetch(`${backendUrl}/api/projects`);
        if (!response.ok) {
            // Provide a more specific error if the fetch fails
            throw new Error(`Failed to load projects. Server responded with status: ${response.status}`);
        }
        allProjects = await response.json();
    } catch (error) {
        // This catch block will now handle both network errors and the JSON parsing error
        if (error instanceof SyntaxError) {
            // This specifically catches the "Unexpected token '<'" error
            console.error("The server did not return valid JSON. It likely returned an HTML error page.");
            error.message = "Could not connect to the project server. Please check the backend URL and ensure it's running.";
        }
        console.error("Error fetching projects:", error);
        projectGrid.innerHTML = `<div class="no-project-card"><i class="fa-solid fa-exclamation-triangle fa-4x"></i><p>Could not load projects from GitHub. Is the server running?</p></div>`;
        return;
    }

    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    let projectsToDisplay = allProjects;

    if (searchQuery) {
        // If there is a search query, filter the projects
        searchHeader.innerHTML = `<h2>Search Results for: "${searchQuery}"</h2>`;
        projectsToDisplay = allProjects.filter(project =>
            project.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else {
        searchHeader.innerHTML = `<h2>All Projects</h2>`;
    }

    if (projectsToDisplay.length === 0) {
        // If no projects are stored, display the placeholder message
        let message = '';
        if (searchQuery) {
            message = `<p>No projects found matching your search.</p>`;
        } else {
            message = `
                <p>There are no projects here yet.</p>
                <a href="doc.html" class="btn-upload-first">Upload Your First Project</a>
            `;
        }
        projectGrid.innerHTML = `<div class="no-project-card"><i class="fa-solid fa-folder-open fa-4x"></i>${message}</div>`;
    } else {
        // If there are projects, create a card for each one
        projectsToDisplay.slice().reverse().forEach(project => { // .slice().reverse() to show newest first
            const card = document.createElement('div');
            card.className = 'project-card';

            // Truncate long code for preview
            const codeSnippet = project.code.length > 150
                ? project.code.substring(0, 150) + '...'
                : project.code;

            card.innerHTML = `
                <div class="card-header">
                    <h3>${project.title}</h3>
                    <span class="language-tag ${project.language}">${project.language}</span>
                </div>
                <div class="card-body">
                    <pre><code>${codeSnippet.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                </div>
                <div class="card-footer">
                    <!-- Date is not available from this API, so the footer can be simplified or removed -->
                    <span>Source: GitHub</span>
                </div>
            `;
            projectGrid.appendChild(card);
        });
    }
});