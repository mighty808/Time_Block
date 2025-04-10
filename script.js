document.addEventListener('DOMContentLoaded', function() {
    
    const API_BASE_URL = 'http://localhost:8080/';
    

    const eventForm = document.getElementById('eventForm');
    const eventNameInput = document.getElementById('eventName');
    const activityInput = document.getElementById('activity');
    const descriptionInput = document.getElementById('description');
    const timeInput = document.getElementById('time');
    const priorityInput = document.getElementById('priority');
    const addEventBtn = document.getElementById('addEventBtn');
    const timeBlocksContainer = document.querySelector('.time-blocks-container');
    
    
    if (eventForm) {
        eventForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (addEventBtn) {
        addEventBtn.addEventListener('click', handleAddEvent);
    }
    
    
    if (timeBlocksContainer) {
        loadTimeBlocks();
    }
    
    
    async function loadTimeBlocks() {
        try {
            const response = await fetch(API_BASE_URL);
            const timeBlocks = await response.json();
            displayTimeBlocks(timeBlocks);
        } catch (error) {
            console.error('Error loading time blocks:', error);
        }
    }
    
    function displayTimeBlocks(timeBlocks) {
        const container = document.querySelector('.time-blocks-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (timeBlocks.length === 0) {
            container.innerHTML = '<p class="text-center py-4">No time blocks found</p>';
            return;
        }
        
        
        const groupedByDate = {};
        timeBlocks.forEach(block => {
            const dateStr = new Date(block.startTime).toLocaleDateString();
            if (!groupedByDate[dateStr]) {
                groupedByDate[dateStr] = [];
            }
            groupedByDate[dateStr].push(block);
        });
        
        
        for (const date in groupedByDate) {
            const dateHeader = document.createElement('div');
            dateHeader.className = 'p-3 bg-blue-300 shadow flex justify-between items-center rounded-t-lg';
            dateHeader.innerHTML = `
                <h3 class="text-md font-semibold">${date}</h3>
                <div>
                    <button class="bg-blue-500 w-15 text-white rounded-lg h-10 font-semibold text-md">Week</button>
                    <button class="bg-blue-500 w-15 text-white rounded-lg h-10 font-semibold text-md">Day</button>
                </div>
            `;
            container.appendChild(dateHeader);
            
            const blocksSection = document.createElement('section');
            blocksSection.className = 'grid grid-cols-1';
            
            groupedByDate[date].forEach((block, index) => {
                const isLast = index === groupedByDate[date].length - 1;
                const blockElement = createTimeBlockElement(block, isLast);
                blocksSection.appendChild(blockElement);
            });
            
            container.appendChild(blocksSection);
        }
    }
    
    function createTimeBlockElement(block, isLast = false) {
        const startTime = new Date(block.startTime);
        const endTime = new Date(block.endTime);
        
        
        let bgColor = block.color || getPriorityColor(block.priority || 'medium');
        
        const blockDiv = document.createElement('div');
        blockDiv.className = `p-6 shadow flex justify-between ${isLast ? 'rounded-b-lg' : ''}`;
        blockDiv.style.backgroundColor = bgColor;
        blockDiv.dataset.id = block.id;
        
        blockDiv.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold">${block.title}</h3>
                <p class="text-gray-600">${formatTime(startTime)} - ${formatTime(endTime)}</p>
                ${block.description ? `<p class="mt-2">${block.description}</p>` : ''}
            </div>
            <div class="flex items-center">
                <button class="delete-btn bg-red-500 w-20 text-white rounded-lg h-10 font-semibold text-md" data-id="${block.id}">
                    Delete
                </button>
            </div>
        `;
        
       
        const deleteBtn = blockDiv.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteTimeBlock(block.id));
        }
        
        return blockDiv;
    }
    
    function getPriorityColor(priority) {
        const colors = {
            'high': 'bg-red-100',
            'medium': 'bg-yellow-100',
            'low': 'bg-green-100'
        };
        return colors[priority.toLowerCase()] || 'bg-blue-100';
    }
    
    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    async function handleAddEvent() {
        const title = eventNameInput.value.trim();
        const activity = activityInput.value.trim();
        const description = descriptionInput.value.trim();
        const time = timeInput.value;
        const priority = priorityInput.value;
        
        if (!title || !activity || !time) {
            alert('Please fill in all required fields');
            return;
        }
        
    
        const startTime = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + 1);
        
        const timeBlockData = {
            title: `${title} - ${activity}`,
            description,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            priority,
            color: getPriorityColor(priority)
        };
        
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(timeBlockData)
            });
             
            if (response.ok) {
                alert('Time block added successfully!');
                eventForm.reset();
                loadTimeBlocks();
            } else {
                throw new Error('Failed to add time block');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add time block');
        }
    }
    
    async function deleteTimeBlock(id) {
        if (!confirm('Are you sure you want to delete this time block?')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadTimeBlocks();
            } else {
                throw new Error('Failed to delete time block');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete time block');
        }
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        handleAddEvent();
    }
});