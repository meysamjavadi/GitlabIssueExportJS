(async () => {
    const token = 'kjkjkjkj'; // Replace with your GitLab personal access token
    const projectId = '1'; // Numeric project ID or URL-encoded path (e.g. namespace%2Fproject)
    const perPage = 100;
    let page = 1;
    let allIssues = [];
    let morePages = true;

    while (morePages) {
        const res = await fetch(`http://YourURL/api/v4/projects/${projectId}/issues?per_page=${perPage}&page=${page}`, {
            headers: { 'PRIVATE-TOKEN': token }
        });
        const issues = await res.json();
        if (issues.length > 0) {
            allIssues = allIssues.concat(issues);
            page++;
        } else {
            morePages = false;
        }
    }

    // CSV header with new fields
    const csvHeader = ['id', 'title', 'state', 'created_at', 'author', 'assignee', 'labels', 'description', 'web_url'];
    const csvRows = [csvHeader.join(',')];

    // Escape function for CSV fields (handles commas, quotes, newlines)
    function escapeCsvField(text) {
        if (!text) return '';
        return `"${text.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`; // Replace newlines with space
    }

    allIssues.forEach(issue => {
        const labels = issue.labels ? issue.labels.join('; ') : '';
        const description = issue.description || '';

        const row = [
            issue.id,
            escapeCsvField(issue.title),
            issue.state,
            issue.created_at,
            issue.author?.username || '',
            issue.assignees[0]?.username || '',
            escapeCsvField(labels),
            escapeCsvField(description),
            issue.web_url
        ];
        csvRows.push(row.join(','));
    });

    // Create and download CSV file
    const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gitlab_issues_with_labels_description.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
})();
