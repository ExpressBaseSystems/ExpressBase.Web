// Mock backend data - In real application, this would come from your backend API
//const mockBackendData = {
//    'users': '',
//    'products': 'Product catalog and inventory details',
//    'orders': '',
//    'categories': 'Product categorization system',
//    'inventory': 'Stock levels and warehouse management',
//    'customers': '',
//    'suppliers': 'Vendor and supplier contact information',
//    'transactions': 'Financial transaction records',
//    'reviews': 'Customer feedback and ratings',
//    'shipping_addresses': ''
//};

// Application state
let tableData = [];

// Initialize the application
$(document).ready(function () {
    console.log('Data Table Manager initialized');
    loadTableData();
    setupEventHandlers();
});

// Simulate loading data from backend
function loadTableData() {
    // Simulate API call delay
    $.ajax({
        url: `/openai/GetExistingData`,
        method: 'GET',
        success: function (response) {
            const parsed = JSON.parse(response);
            tableData = Object.keys(parsed).map(tableName => ({
                tableName: tableName,
                description: parsed[tableName] || ''
            }));
            renderTable(); 
        },
        error: function () {
            showToast('Error for creating new conversation', 'error');
        }
    });
    
}

// Render the table with data
function renderTable() {
    const tableBody = $('#tableBody');
    tableBody.empty();

    if (tableData.length === 0) {
        tableBody.append(`
            <tr>
                <td colspan="2" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    No tables found. Loading...
                </td>
            </tr>
        `);
        return;
    }

    tableData.forEach((item, index) => {
        const row = `
            <tr>
                <td>
                    <div class="table-name">${escapeHtml(item.tableName)}</div>
                </td>
                <td>
                    <textarea 
                        class="description-input" 
                        data-index="${index}"
                        placeholder="Enter description for ${escapeHtml(item.tableName)} table..."
                        rows="3"
                    >${escapeHtml(item.description)}</textarea>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });

    // Update event handlers for new elements
    setupDescriptionHandlers();
}

// Setup event handlers
function setupEventHandlers() {
    // Save button click handler
    $('#saveBtn').on('click', function () {
        saveChanges();
    });

    // Keyboard shortcuts
    $(document).on('keydown', function (e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveChanges();
        }
    });
}

// Setup description input handlers
function setupDescriptionHandlers() {
    $('.description-input').on('input', function () {
        const index = parseInt($(this).data('index'));
        const value = $(this).val();

        if (tableData[index]) {
            tableData[index].description = value;
        }
    });

    // Auto-resize textareas
    $('.description-input').on('input', function () {
        autoResizeTextarea(this);
    });

    // Initial resize
    $('.description-input').each(function () {
        autoResizeTextarea(this);
    });
}

// Auto-resize textarea based on content
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(80, textarea.scrollHeight) + 'px';
}

// Save changes function
function saveChanges() {
    const saveBtn = $('#saveBtn');
    const btnText = saveBtn.find('.btn-text');
    const btnLoader = saveBtn.find('.btn-loader');

    // Show loading state
    saveBtn.prop('disabled', true);
    btnText.hide();
    btnLoader.show();

    // Prepare data for API call - table name as key, description as value
    const apiData = {};
    tableData.forEach(item => {
        apiData[item.tableName] = item.description.trim();
    });

    // Simulate API call to save data
    setTimeout(() => {
        try {
            // Here you would make your actual API call
            // Example: 
            // $.ajax({
            //     url: '/api/table-descriptions',
            //     method: 'POST',
            //     data: JSON.stringify(apiData),
            //     contentType: 'application/json',
            //     success: function(response) {
            //         showNotification('Changes saved successfully!', 'success');
            //     },
            //     error: function(xhr, status, error) {
            //         showNotification('Failed to save changes. Please try again.', 'error');
            //     }
            // });

            // For demo purposes, we'll just log the data and show success
            console.log('Saving table data as JSON:', apiData);
            console.log('JSON string to send to API:', JSON.stringify(apiData));
            showNotification('Changes saved successfully!', 'success');

        } catch (error) {
            console.error('Save error:', error);
            showNotification('Failed to save changes. Please try again.', 'error');
        } finally {
            // Reset button state
            saveBtn.prop('disabled', false);
            btnText.show();
            btnLoader.hide();
        }
    }, 1500);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = $('#notification');

    notification
        .removeClass('success error warning')
        .addClass(type)
        .text(message)
        .show();

    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => {
            notification.hide().css('animation', '');
        }, 300);
    }, 300);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for potential external use
window.tableManager = {
    loadTableData,
    saveChanges,
    showNotification
};
