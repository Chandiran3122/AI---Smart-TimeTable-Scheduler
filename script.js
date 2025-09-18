        // --- NOTE: This is a fully self-contained prototype. No actual server or Firebase connection is made. ---
        
        // --- Global State ---
        let currentUser = null; // Simulated auth user object
        let userData = null;    // Detailed user profile from our mock DB
        let clockInterval = null;
        
        // --- UI Elements ---
        const loginScreen = document.getElementById('login-screen');
        const registerScreen = document.getElementById('register-screen');
        const dashboardScreen = document.getElementById('dashboard-screen');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        const logoutBtn = document.getElementById('logout-btn');
        const hub = document.getElementById('section-selector-hub');
        const hubSelectors = document.getElementById('hub-selectors');
        const adminHodControls = document.getElementById('admin-hod-controls');
        const facultyDashboard = document.getElementById('faculty-dashboard');
        const timetableContainer = document.getElementById('timetable-container');
        const timetableOutput = document.getElementById('timetable-output');
        const generateBtn = document.getElementById('generate-btn');
        const uploadTimetableBtn = document.getElementById('upload-timetable-btn');
        const generationStatus = document.getElementById('generation-status');
        const editModalContainer = document.getElementById('edit-modal');
        const aiSuggestionModalContainer = document.getElementById('ai-suggestion-modal');
        const aiAnalysisModalContainer = document.getElementById('ai-analysis-modal');
        const uploadModalContainer = document.getElementById('upload-modal');
        const attendanceModalContainer = document.getElementById('attendance-modal');
        const analyzeTimetableBtn = document.getElementById('analyze-timetable-btn');
        const showRegisterLink = document.getElementById('show-register-link');
        const showLoginLink = document.getElementById('show-login-link');
        
        // --- Mock Data Store ---
        let MOCK_USERS = {};
        let MOCK_DB = {};

        // --- State Management using localStorage for persistence ---
        function saveState() {
            localStorage.setItem('smartScheduler_DB', JSON.stringify(MOCK_DB));
            localStorage.setItem('smartScheduler_Users', JSON.stringify(MOCK_USERS));
        }

        function loadState() {
            // Default data to populate if localStorage is empty
            const defaultUsers = {
                'admin@admin.com': { uid: 'admin_user', name: 'Admin User', role: 'Administrator', departmentId: 'admin_dept' },
                'hod@hodcse.com': { uid: 'hod_user', name: 'Dr. Ada Lovelace', role: 'HOD', departmentId: 'cse_dept' },
                'facu@facucse.com': { uid: 'faculty_user_facu', name: 'Dr. Grace Hopper', role: 'Faculty', departmentId: 'cse_dept' },
                'stu@stucse.com': { uid: 'student_user_stu', name: 'Alan Turing', role: 'Student', departmentId: 'cse_dept' },
                'hod@hodmech.com': { uid: 'hod_mech_user_hod', name: 'Dr. James Watt', role: 'HOD', departmentId: 'mech_dept' },
                'facu@facumech.com': { uid: 'faculty_mech_user_facu', name: 'Prof. Karl Benz', role: 'Faculty', departmentId: 'mech_dept'},
            };
             const defaultDB = {
                'cse_dept': {
                    name: 'Computer Science', short: 'CSE',
                    years: {
                        '1': { name: '1st Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '2': { name: '2nd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '3': { name: '3rd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '4': { name: '4th Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } }
                    },
                    courses: [ { id: 'c1', name: 'Data Structures', code: 'CS201', type: 'Theory' }, { id: 'c2', name: 'OS Lab', code: 'CS202L', type: 'Lab' } ],
                    faculty: [ { id: 'f1', name: 'Dr. Turing', expertise: 'Algorithms' }, { id: 'f3', name: 'Dr. Grace Hopper', expertise: 'Networking' } ],
                    rooms: [ { id: 'r1', name: 'CR-101', capacity: '60', type: 'Theory' }, { id: 'r2', name: 'Lab-202', capacity: '30', type: 'Lab' } ],
                },
                'mech_dept': {
                    name: 'Mechanical Engineering', short: 'MECH',
                    years: {
                        '1': { name: '1st Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '2': { name: '2nd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '3': { name: '3rd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '4': { name: '4th Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } }
                    },
                    courses: [ { id: 'm1', name: 'Thermodynamics', code: 'ME201', type: 'Theory' } ],
                    faculty: [ { id: 'mf1', name: 'Dr. James Watt', expertise: 'Fluid Mechanics' }, { id: 'mf2', name: 'Prof. Karl Benz', expertise: 'Automotive' } ],
                    rooms: [ { id: 'mr1', name: 'ME-105', capacity: '70', type: 'Theory' } ],
                },
                'it_dept': {
                    name: 'Information Technology', short: 'IT',
                    years: {
                        '1': { name: '1st Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '2': { name: '2nd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '3': { name: '3rd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '4': { name: '4th Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } }
                    },
                    courses: [ { id: 'c1', name: 'Data Structures', code: 'CS201', type: 'Theory' }, { id: 'c2', name: 'OS Lab', code: 'CS202L', type: 'Lab' } ],
                    faculty: [ { id: 'f1', name: 'Dr. RamKumar', expertise: 'Algorithms' }, { id: 'f3', name: 'Dr. Muthu', expertise: 'Networking' } ],
                    rooms: [ { id: 'r1', name: 'CR-101', capacity: '60', type: 'Theory' }, { id: 'r2', name: 'Lab-202', capacity: '30', type: 'Lab' } ],
                },
                'ai&ds_dept': {
                    name: 'Artifical Intelligence and Data Science', short: 'AI&DS',
                    years: {
                        '1': { name: '1st Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '2': { name: '2nd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '3': { name: '3rd Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } },
                        '4': { name: '4th Year', sections: { 'A': { timetable: null }, 'B': { timetable: null } } }
                    },
                    courses: [ { id: 'c1', name: 'Data Structures', code: 'CS201', type: 'Theory' }, { id: 'c2', name: 'OS Lab', code: 'CS202L', type: 'Lab' } ],
                    faculty: [ { id: 'f1', name: 'Mrs. Indu', expertise: 'Data Structure and Algorithms' }, { id: 'f3', name: 'Dr. Grace', expertise: 'Machine Learning' } ],
                    rooms: [ { id: 'r1', name: 'CR-101', capacity: '60', type: 'Theory' }, { id: 'r2', name: 'Lab-202', capacity: '30', type: 'Lab' } ],
                },
                'admin_dept': { name: 'Administration', short: 'admin', years: {}, courses: [], faculty: [], rooms: [] }
            };

            const storedDB = localStorage.getItem('smartScheduler_DB');
            const storedUsers = localStorage.getItem('smartScheduler_Users');
            if (storedDB && storedUsers) {
                MOCK_DB = JSON.parse(storedDB);
                MOCK_USERS = JSON.parse(storedUsers);
            } else {
                MOCK_DB = defaultDB; 
                MOCK_USERS = defaultUsers;
                saveState();
            }
        }

        // --- Initial Setup (Run on Load) ---
        function startApp() {
            loadState(); 
            lucide.createIcons();
            populateDepartmentDropdowns();
            setupChatWidget();
            setupEditModal();
            setupRoleBasedLoginUI();
            setupAuthToggles();
            setupUploadModal();
            setupCollapsibles();

            // Check for a saved session to auto-login
            const savedUserJSON = sessionStorage.getItem('smartSchedulerUser');
            if (savedUserJSON) {
                try {
                    const savedUser = JSON.parse(savedUserJSON);
                    setupDashboard(savedUser);
                } catch (e) {
                    console.error("Failed to parse session data", e);
                    sessionStorage.removeItem('smartSchedulerUser');
                }
            }
        }
        startApp();
        
        // --- UI Initialization functions ---

        function showLogin() {
            loginScreen.classList.remove('hidden');
            registerScreen.classList.add('hidden');
            dashboardScreen.classList.add('hidden');
        }
        
        function showDashboard() {
            loginScreen.classList.add('hidden');
            registerScreen.classList.add('hidden');
            dashboardScreen.classList.remove('hidden');
        }

        function setupEditModal() {
            // This function was missing, causing a startup error. 
            // Event listeners for showing the edit modal are handled dynamically within renderTimetable.
            // This function is kept for structural consistency.
        }

        function populateDepartmentDropdowns() {
            const options = `<option value="" disabled selected>Select a Department</option>` + 
                Object.entries(MOCK_DB).filter(([id]) => id !== 'admin_dept').map(([id, data]) => `<option value="${id}">${data.name}</option>`).join('');
            document.getElementById('department-select').innerHTML = options;
            document.getElementById('register-department-select').innerHTML = options;
        }

        function setupAuthToggles() {
            showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginScreen.classList.add('hidden'); registerScreen.classList.remove('hidden'); });
            showLoginLink.addEventListener('click', (e) => { e.preventDefault(); registerScreen.classList.add('hidden'); loginScreen.classList.remove('hidden'); });
        }

        function setupRoleBasedLoginUI() {
            const roleSelects = [
                { role: document.getElementById('role-select'), wrapper: document.getElementById('login-department-wrapper') },
                { role: document.getElementById('register-role-select'), wrapper: document.getElementById('register-department-wrapper') }
            ];

            roleSelects.forEach(({ role, wrapper }) => {
                const departmentSelect = wrapper.querySelector('select');
                role.addEventListener('change', () => {
                    if (role.value === 'Administrator') {
                        wrapper.classList.add('hidden');
                        departmentSelect.required = false;
                    } else {
                        wrapper.classList.remove('hidden');
                        departmentSelect.required = true;
                    }
                });
            });
        }
        
        function setupCollapsibles() {
            const toggles = document.querySelectorAll('[id^="toggle-"]');
            toggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const content = document.getElementById(toggle.id.replace('toggle-', '') + '-content');
                    const icon = toggle.querySelector('.collapsible-icon');
                    if (content.style.maxHeight) {
                        content.style.maxHeight = null;
                        if (icon) icon.style.transform = 'rotate(0deg)';
                    } else {
                        content.style.maxHeight = content.scrollHeight + "px";
                        if (icon) icon.style.transform = 'rotate(180deg)';
                    }
                });
            });
        }

        // --- Clock Functionality ---
        function updateClock() {
            const now = new Date();
            const timeOpts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
            const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('time-display').textContent = now.toLocaleTimeString('en-US', timeOpts);
            document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', dateOpts);
        }

        // --- Authentication (Simulated) ---
        function setupDashboard(user) {
            userData = user;
            sessionStorage.setItem('smartSchedulerUser', JSON.stringify(userData));
            currentUser = { uid: userData.uid, isSimulated: true };
            showDashboard();
            updateDashboardHeader();
            loadDashboardContent();
            if (clockInterval) clearInterval(clockInterval);
            updateClock();
            clockInterval = setInterval(updateClock, 1000);
        }
        
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const role = loginForm['role-select'].value;
            let departmentId = loginForm['department-select'].value;
            const loginButton = loginForm.querySelector('button[type="submit"]');
            
            loginError.textContent = '';
            if (!role) { loginError.textContent = 'Please select your role.'; return; }
            if (role === 'Administrator') { departmentId = 'admin_dept'; }
            if (role !== 'Administrator' && !departmentId) { loginError.textContent = 'Please select a department.'; return; }

            loginButton.disabled = true;
            loginButton.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="ml-2">Signing In...</span>`;
            await new Promise(res => setTimeout(res, 500));
            
            const baseUser = MOCK_USERS[email];
            let loginSuccessful = false;
            
            if (!baseUser) {
                loginError.textContent = `User with email '${email}' not found.`;
            } else if (baseUser.role !== role) {
                loginError.textContent = `User is not registered as a(n) ${role}.`;
            } else if (baseUser.departmentId !== departmentId) {
                loginError.textContent = `User does not belong to the selected department.`;
            } else if (password !== 'password123') { // Simplified password check
                loginError.textContent = `Invalid password.`;
            } else {
                const fullUserData = { ...baseUser, email: email, department: MOCK_DB[baseUser.departmentId].name };
                setupDashboard(fullUserData);
                loginSuccessful = true;
            }

            if (!loginSuccessful) {
                loginButton.disabled = false;
                loginButton.innerHTML = "Sign In";
            }
        });
        
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerForm['register-name'].value;
            const email = registerForm['register-email'].value;
            const password = registerForm['register-password'].value;
            const role = registerForm['register-role-select'].value;
            let departmentId = registerForm['register-department-select'].value;
            const registerButton = registerForm.querySelector('button[type="submit"]');

            registerError.textContent = '';
            if (!role) { registerError.textContent = 'Please select your role.'; return; }
            if (role === 'Administrator') { departmentId = 'admin_dept'; }
            if (role !== 'Administrator' && !departmentId) { registerError.textContent = 'Please select a department.'; return; }
            if(MOCK_USERS[email]) { registerError.textContent = 'An account with this email already exists.'; return; }

            registerButton.disabled = true;
            registerButton.innerHTML = `<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="ml-2">Creating Account...</span>`;
            await new Promise(res => setTimeout(res, 500));

            const newUser = {
                uid: `user_${Date.now()}`,
                name: name,
                role: role,
                departmentId: departmentId,
            };

            MOCK_USERS[email] = newUser;
            saveState();

            const fullUserData = { ...newUser, email: email, department: MOCK_DB[newUser.departmentId].name };
            setupDashboard(fullUserData);
        });

        function handleLogout() {
            sessionStorage.removeItem('smartSchedulerUser');
            currentUser = null;
            userData = null;
            if (clockInterval) clearInterval(clockInterval);
            loginForm.reset();
            registerForm.reset();
            document.getElementById('login-department-wrapper').classList.add('hidden');
            document.getElementById('register-department-wrapper').classList.add('hidden');
            document.getElementById('login-form').querySelector('button[type="submit"]').disabled = false;
            document.getElementById('login-form').querySelector('button[type="submit"]').innerHTML = "Sign In";
            showLogin();
        }
        logoutBtn.addEventListener('click', handleLogout);

        // --- Dashboard Content Loading ---

        function updateDashboardHeader() {
            document.getElementById('user-name').textContent = `Welcome, ${userData.name.split(' ')[0]}`;
            document.getElementById('user-role-dept').textContent = `${userData.role} | ${userData.department}`;
        }
        
        function loadDashboardContent() {
            // Reset UI
            hub.classList.add('hidden');
            adminHodControls.classList.add('hidden');
            facultyDashboard.classList.add('hidden');
            timetableContainer.classList.add('hidden');
            timetableOutput.innerHTML = `<p class="text-gray-500 text-center py-10">Select options above to view the timetable.</p>`;
            
            // Load content based on role
            switch (userData.role) {
                case 'Administrator':
                    renderAdminHub();
                    break;
                case 'HOD':
                    renderHODHub();
                    break;
                case 'Faculty':
                case 'Student':
                    renderStudentFacultyHub();
                    if(userData.role === 'Faculty') renderFacultyDashboard();
                    break;
            }
        }
        
        function renderAdminHub() {
            hub.classList.remove('hidden');
            adminHodControls.classList.remove('hidden');
            timetableContainer.classList.remove('hidden');
            document.getElementById('hub-title').textContent = 'Administrator Control Hub';

            const departmentOptions = Object.entries(MOCK_DB)
                .filter(([id,]) => id !== 'admin_dept')
                .map(([id, data]) => `<option value="${id}">${data.name}</option>`).join('');

            hubSelectors.innerHTML = `
                <select id="hub-dept-select" class="form-input rounded-lg w-64">
                    <option value="">Select Department</option>
                    ${departmentOptions}
                </select>
                <select id="hub-year-select" class="form-input rounded-lg w-48" disabled><option>Select Year</option></select>
                <select id="hub-section-select" class="form-input rounded-lg w-48" disabled><option>Select Section</option></select>
            `;
            
            const deptSelect = document.getElementById('hub-dept-select');
            const yearSelect = document.getElementById('hub-year-select');
            const sectionSelect = document.getElementById('hub-section-select');

            deptSelect.addEventListener('change', () => {
                const deptId = deptSelect.value;
                if (!deptId) return;
                
                renderDataManagementPanel('courses', 'Courses', ['name', 'code', 'type'], deptId);
                renderDataManagementPanel('faculty', 'Faculty', ['name', 'expertise'], deptId);
                renderDataManagementPanel('rooms', 'Rooms', ['name', 'capacity', 'type'], deptId);

                const deptData = MOCK_DB[deptId];
                yearSelect.innerHTML = '<option value="">Select Year</option>' + Object.entries(deptData.years)
                    .map(([yearId, yearData]) => `<option value="${yearId}">${yearData.name}</option>`).join('');
                yearSelect.disabled = false;
                sectionSelect.disabled = true;
                sectionSelect.innerHTML = '<option>Select Section</option>';
            });

            yearSelect.addEventListener('change', () => {
                const deptId = deptSelect.value;
                const yearId = yearSelect.value;
                if (!deptId || !yearId) return;

                const yearData = MOCK_DB[deptId].years[yearId];
                sectionSelect.innerHTML = '<option value="">Select Section</option>' + Object.keys(yearData.sections)
                    .map(section => `<option value="${section}">Section ${section}</option>`).join('');
                sectionSelect.disabled = false;
            });
            
            sectionSelect.addEventListener('change', () => {
                if (deptSelect.value && yearSelect.value && sectionSelect.value) {
                    renderTimetable(deptSelect.value, yearSelect.value, sectionSelect.value);
                }
            });
            
            generateBtn.onclick = () => {
                if(deptSelect.value && yearSelect.value && sectionSelect.value) {
                    GA_run(deptSelect.value, yearSelect.value, sectionSelect.value);
                } else {
                    generationStatus.textContent = 'Please select department, year, and section first.';
                    setTimeout(() => generationStatus.textContent = '', 3000);
                }
            };
        }

        function renderHODHub() {
            const deptId = userData.departmentId;
            const deptData = MOCK_DB[deptId];
            
            hub.classList.remove('hidden');
            adminHodControls.classList.remove('hidden');
            timetableContainer.classList.remove('hidden');
            document.getElementById('hub-title').textContent = `${deptData.name} - HOD Dashboard`;

            const yearOptions = Object.entries(deptData.years).map(([id, data]) => `<option value="${id}">${data.name}</option>`).join('');
            
            hubSelectors.innerHTML = `
                <select id="hub-year-select" class="form-input rounded-lg w-48">
                    <option value="">Select Year</option>
                    ${yearOptions}
                </select>
                <select id="hub-section-select" class="form-input rounded-lg w-48" disabled><option>Select Section</option></select>
            `;
            
            renderDataManagementPanel('courses', 'Courses', ['name', 'code', 'type'], deptId);
            renderDataManagementPanel('faculty', 'Faculty', ['name', 'expertise'], deptId);
            renderDataManagementPanel('rooms', 'Rooms', ['name', 'capacity', 'type'], deptId);

            const yearSelect = document.getElementById('hub-year-select');
            const sectionSelect = document.getElementById('hub-section-select');

            yearSelect.addEventListener('change', () => {
                const yearId = yearSelect.value;
                if (!yearId) return;
                
                const yearData = deptData.years[yearId];
                sectionSelect.innerHTML = '<option value="">Select Section</option>' + Object.keys(yearData.sections)
                    .map(section => `<option value="${section}">Section ${section}</option>`).join('');
                sectionSelect.disabled = false;
            });
            
            sectionSelect.addEventListener('change', () => {
                if (yearSelect.value && sectionSelect.value) {
                    renderTimetable(deptId, yearSelect.value, sectionSelect.value);
                }
            });

            generateBtn.onclick = () => {
                if(yearSelect.value && sectionSelect.value) {
                    GA_run(deptId, yearSelect.value, sectionSelect.value);
                } else {
                    generationStatus.textContent = 'Please select year and section first.';
                    setTimeout(() => generationStatus.textContent = '', 3000);
                }
            };
        }

        function renderStudentFacultyHub() {
            const deptId = userData.departmentId;
            const deptData = MOCK_DB[deptId];
            hub.classList.remove('hidden');
            timetableContainer.classList.remove('hidden');
            document.getElementById('hub-title').textContent = 'Timetable Viewer';
            
            const yearOptions = Object.entries(deptData.years).map(([id, data]) => `<option value="${id}">${data.name}</option>`).join('');
            
            hubSelectors.innerHTML = `
                <div class="font-semibold text-lg text-gray-700">${deptData.name}</div>
                <select id="hub-year-select" class="form-input rounded-lg w-48">
                    <option value="">Select Year</option>
                    ${yearOptions}
                </select>
                <select id="hub-section-select" class="form-input rounded-lg w-48" disabled><option>Select Section</option></select>
            `;
             const yearSelect = document.getElementById('hub-year-select');
            const sectionSelect = document.getElementById('hub-section-select');

            yearSelect.addEventListener('change', () => {
                const yearId = yearSelect.value;
                if (!yearId) return;
                
                const yearData = deptData.years[yearId];
                sectionSelect.innerHTML = '<option value="">Select Section</option>' + Object.keys(yearData.sections)
                    .map(section => `<option value="${section}">Section ${section}</option>`).join('');
                sectionSelect.disabled = false;
            });
            
            sectionSelect.addEventListener('change', () => {
                if (yearSelect.value && sectionSelect.value) {
                    renderTimetable(deptId, yearSelect.value, sectionSelect.value);
                }
            });
        }
        
        function renderFacultyDashboard() {
            facultyDashboard.classList.remove('hidden');
            const dailyScheduleContainer = document.getElementById('daily-schedule');
            
            const facultyName = userData.name;
            let scheduleFound = false;
            let scheduleHTML = '';

            const today = new Date().toLocaleString('en-us', {weekday: 'long'}); // e.g., "Monday"

            Object.entries(MOCK_DB).forEach(([deptId, dept]) => {
                Object.entries(dept.years).forEach(([yearId, year]) => {
                    Object.entries(year.sections).forEach(([sectionId, section]) => {
                        if (section.timetable && section.timetable[today]) {
                            section.timetable[today].forEach((slot, index) => {
                                if (slot && slot.faculty === facultyName) {
                                    scheduleFound = true;
                                    scheduleHTML += `
                                        <div class="bg-indigo-50 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p class="font-bold text-indigo-800">${slot.course}</p>
                                                <p class="text-sm text-gray-600">Period ${index + 1} | Room: ${slot.room} | ${dept.short} ${year.name} - Sec ${sectionId}</p>
                                            </div>`;

                                    if (slot.attendanceSubmitted) {
                                        scheduleHTML += `
                                            <div class="flex items-center gap-2 text-green-600 font-semibold text-sm">
                                                <i data-lucide="check-circle-2" class="w-5 h-5"></i>
                                                <span>Submitted</span>
                                            </div>`;
                                    } else {
                                        scheduleHTML += `
                                            <button class="mark-attendance-btn bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-600"
                                                data-dept-id="${deptId}"
                                                data-year-id="${yearId}"
                                                data-section-id="${sectionId}"
                                                data-course-name="${slot.course}"
                                                data-day="${today}"
                                                data-period-index="${index}">
                                                Mark Attendance
                                            </button>`;
                                    }
                                    scheduleHTML += `</div>`;
                                }
                            });
                        }
                    });
                });
            });

            if (scheduleFound) {
                dailyScheduleContainer.innerHTML = scheduleHTML;
            } else {
                dailyScheduleContainer.innerHTML = `<p class="text-gray-500 text-center py-5">You have no classes scheduled for today (${today}).</p>`;
            }

            lucide.createIcons();

            dailyScheduleContainer.querySelectorAll('.mark-attendance-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const { deptId, yearId, sectionId, courseName, day, periodIndex } = e.currentTarget.dataset;
                    showAttendanceModal(deptId, yearId, sectionId, courseName, day, parseInt(periodIndex));
                });
            });
        }

        // --- Data Management Panel ---
        function renderDataManagementPanel(dataKey, title, fields, departmentId) {
            const panel = document.getElementById(`${dataKey}-panel`);
            const data = MOCK_DB[departmentId][dataKey];

            let itemsHtml = data.map((item, index) => `
                <div class="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                    <span class="text-sm">${item.name}</span>
                    <div>
                        <button class="p-1 text-gray-500 hover:text-red-600" data-action="delete" data-index="${index}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `).join('');

            let formFieldsHtml = fields.map(field => `
                <div class="mb-2">
                    <label class="block text-sm font-medium text-gray-600">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input type="text" name="${field}" required class="form-input mt-1 block w-full px-3 py-2 rounded-md text-sm">
                </div>`).join('');

            panel.innerHTML = `
                <div class="bg-gray-50 p-4 rounded-xl h-full flex flex-col">
                    <h3 class="font-bold text-lg mb-3">${title}</h3>
                    <div class="flex-grow space-y-1 mb-3 pr-2 overflow-y-auto max-h-48">${itemsHtml || '<p class="text-sm text-gray-400">No items yet.</p>'}</div>
                    <form data-action="add" class="mt-auto">
                        ${formFieldsHtml}
                        <button type="submit" class="w-full btn-primary text-white text-sm font-semibold py-2 px-4 rounded-md mt-2">Add New</button>
                    </form>
                </div>
            `;
            
            panel.querySelectorAll('button[data-action="delete"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    MOCK_DB[departmentId][dataKey].splice(index, 1);
                    saveState();
                    renderDataManagementPanel(dataKey, title, fields, departmentId);
                });
            });

            panel.querySelector('form[data-action="add"]').addEventListener('submit', (e) => {
                e.preventDefault();
                const form = e.target;
                const newItem = { id: `${dataKey.charAt(0)}${Date.now()}` };
                fields.forEach(field => {
                    newItem[field] = form[field].value;
                });
                MOCK_DB[departmentId][dataKey].push(newItem);
                saveState();
                renderDataManagementPanel(dataKey, title, fields, departmentId);
            });
            lucide.createIcons();
        }

        // --- GENETIC ALGORITHM ---
        const GA_CONSTANTS = {
            POPULATION_SIZE: 30,
            MAX_GENERATIONS: 50,
            MUTATION_RATE: 0.1,
            CROSSOVER_RATE: 0.8,
            TOURNAMENT_SIZE: 5,
            HARD_CONSTRAINT_PENALTY: 1000
        };

        // Main function to run the genetic algorithm
        async function GA_run(deptId, yearId, sectionId) {
            generationStatus.innerHTML = `<svg class="animate-spin h-5 w-5 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Starting Genetic Algorithm...`;
            
            const deptData = MOCK_DB[deptId];
            if(deptData.courses.length === 0 || deptData.faculty.length === 0 || deptData.rooms.length === 0) {
                 generationStatus.textContent = `Error: Please add courses, faculty, and rooms first.`;
                 setTimeout(() => generationStatus.textContent = '', 4000);
                 return;
            }

            let population = GA_createInitialPopulation(deptId, GA_CONSTANTS.POPULATION_SIZE);
            let bestTimetable = null;
            let bestFitness = -Infinity;

            for (let gen = 0; gen < GA_CONSTANTS.MAX_GENERATIONS; gen++) {
                // Update UI asynchronously
                await new Promise(resolve => setTimeout(() => {
                    generationStatus.textContent = `Evolving... Generation: ${gen + 1}/${GA_CONSTANTS.MAX_GENERATIONS}, Best Fitness: ${bestFitness.toFixed(2)}`;
                    resolve();
                }, 50));

                const populationWithFitness = population.map(timetable => ({
                    timetable,
                    fitness: GA_calculateFitness(timetable, deptId)
                }));
                
                let currentBest = populationWithFitness.reduce((best, current) => current.fitness > best.fitness ? current : best, {fitness: -Infinity});
                if (currentBest.fitness > bestFitness) {
                    bestFitness = currentBest.fitness;
                    bestTimetable = currentBest.timetable;
                }

                let newPopulation = [];
                for (let i = 0; i < GA_CONSTANTS.POPULATION_SIZE / 2; i++) {
                    const parent1 = GA_tournamentSelection(populationWithFitness).timetable;
                    const parent2 = GA_tournamentSelection(populationWithFitness).timetable;
                    
                    let child1 = { ...parent1 };
                    let child2 = { ...parent2 };

                    if (Math.random() < GA_CONSTANTS.CROSSOVER_RATE) {
                        [child1, child2] = GA_crossover(parent1, parent2);
                    }
                    
                    newPopulation.push(GA_mutate(child1, deptId));
                    newPopulation.push(GA_mutate(child2, deptId));
                }
                population = newPopulation;
            }
            
            generationStatus.textContent = 'Genetic Algorithm finished!';
            MOCK_DB[deptId].years[yearId].sections[sectionId].timetable = bestTimetable;
            saveState();
            renderTimetable(deptId, yearId, sectionId);
            setTimeout(() => generationStatus.textContent = '', 4000);
        }

        // Creates a population of random timetables
        function GA_createInitialPopulation(deptId, size) {
            let population = [];
            for (let i = 0; i < size; i++) {
                population.push(GA_createRandomTimetable(deptId));
            }
            return population;
        }

        // Creates one random timetable
        function GA_createRandomTimetable(deptId) {
            const deptData = MOCK_DB[deptId];
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const periods = 7;
            const newTimetable = {};

            days.forEach(day => {
                newTimetable[day] = [];
                for (let i = 0; i < periods; i++) {
                    const course = deptData.courses[Math.floor(Math.random() * deptData.courses.length)];
                    const faculty = deptData.faculty[Math.floor(Math.random() * deptData.faculty.length)];
                    const room = deptData.rooms.find(r => r.type === course.type) || deptData.rooms[0];
                    newTimetable[day].push({ course: course.name, faculty: faculty.name, room: room.name });
                }
            });
            return newTimetable;
        }

        // Fitness function: The core of the GA. Higher score is better.
        function GA_calculateFitness(timetable, deptId) {
            let fitness = 10000;
            const facultySchedule = {};
            const roomSchedule = {};

            Object.entries(timetable).forEach(([day, slots]) => {
                slots.forEach((slot, period) => {
                    if (slot) {
                        const timeSlotId = `${day}-${period}`;
                        
                        // Hard Constraint: No faculty clashes
                        if (!facultySchedule[slot.faculty]) facultySchedule[slot.faculty] = new Set();
                        if (facultySchedule[slot.faculty].has(timeSlotId)) {
                            fitness -= GA_CONSTANTS.HARD_CONSTRAINT_PENALTY;
                        }
                        facultySchedule[slot.faculty].add(timeSlotId);

                        // Hard Constraint: No room clashes
                        if (!roomSchedule[slot.room]) roomSchedule[slot.room] = new Set();
                        if (roomSchedule[slot.room].has(timeSlotId)) {
                            fitness -= GA_CONSTANTS.HARD_CONSTRAINT_PENALTY;
                        }
                        roomSchedule[slot.room].add(timeSlotId);

                        // Soft Constraint: Penalize labs not in lab rooms
                        const courseInfo = MOCK_DB[deptId].courses.find(c => c.name === slot.course);
                        const roomInfo = MOCK_DB[deptId].rooms.find(r => r.name === slot.room);
                        if(courseInfo && roomInfo && courseInfo.type === 'Lab' && roomInfo.type !== 'Lab') {
                            fitness -= 50;
                        }
                    }
                });
            });
            return fitness;
        }

        // Selection: Pick the best individuals from a random subset
        function GA_tournamentSelection(populationWithFitness) {
            let tournament = [];
            for (let i = 0; i < GA_CONSTANTS.TOURNAMENT_SIZE; i++) {
                const randomIndex = Math.floor(Math.random() * populationWithFitness.length);
                tournament.push(populationWithFitness[randomIndex]);
            }
            return tournament.reduce((best, current) => (current.fitness > best.fitness) ? current : best);
        }

        // Crossover: Combine two parents to create two children
        function GA_crossover(parent1, parent2) {
            const days = Object.keys(parent1);
            const crossoverPoint = Math.floor(Math.random() * days.length);
            const child1 = {}, child2 = {};

            for(let i=0; i < days.length; i++) {
                const day = days[i];
                if (i < crossoverPoint) {
                    child1[day] = parent1[day];
                    child2[day] = parent2[day];
                } else {
                    child1[day] = parent2[day];
                    child2[day] = parent1[day];
                }
            }
            return [child1, child2];
        }

        // Mutation: Introduce random changes into a timetable
        function GA_mutate(timetable, deptId) {
            if (Math.random() > GA_CONSTANTS.MUTATION_RATE) {
                return timetable;
            }

            const days = Object.keys(timetable);
            const randomDay1 = days[Math.floor(Math.random() * days.length)];
            const randomPeriod1 = Math.floor(Math.random() * timetable[randomDay1].length);
            
            const randomDay2 = days[Math.floor(Math.random() * days.length)];
            const randomPeriod2 = Math.floor(Math.random() * timetable[randomDay2].length);

            // Swap two slots
            const temp = timetable[randomDay1][randomPeriod1];
            timetable[randomDay1][randomPeriod1] = timetable[randomDay2][randomPeriod2];
            timetable[randomDay2][randomPeriod2] = temp;
            
            return timetable;
        }


        // --- Timetable Logic ---

        function renderTimetable(deptId, yearId, sectionId) {
            const timetableData = MOCK_DB[deptId].years[yearId].sections[sectionId].timetable;
            const deptName = MOCK_DB[deptId].name;
            document.getElementById('timetable-title').textContent = `Timetable for ${deptName} - ${MOCK_DB[deptId].years[yearId].name}, Section ${sectionId}`;
            
            if (['Administrator', 'HOD'].includes(userData.role)) {
                analyzeTimetableBtn.classList.remove('hidden');
                analyzeTimetableBtn.onclick = () => showAIAnalysisModal(timetableData);
            } else {
                analyzeTimetableBtn.classList.add('hidden');
            }

            if (!timetableData) {
                timetableOutput.innerHTML = `<p class="text-gray-500 text-center py-10">No timetable has been generated for this section yet.</p>`;
                return;
            }

            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            
            let tableHtml = `<table class="w-full border-collapse text-center">
                <thead>
                    <tr>
                        <th class="p-3 border bg-gray-100 font-semibold">Day/Time</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 1</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 2</th>
                        <th class="p-2 border bg-green-100 font-semibold text-green-800 text-xs">Break<br>10:25-10:45am</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 3</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 4</th>
                        <th class="p-2 border bg-amber-100 font-semibold text-amber-800 text-xs">Lunch<br>12:30-1:30pm</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 5</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 6</th>
                        <th class="p-2 border bg-green-100 font-semibold text-green-800 text-xs">Break<br>3:05-3:25pm</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 7</th>
                        <th class="p-3 border bg-gray-100 font-semibold">Period 8</th>
                    </tr>
                </thead>
            <tbody>`;

            days.forEach(day => {
                tableHtml += `<tr><td class="p-3 border bg-gray-50 font-semibold">${day}</td>`;
                
                const renderSlot = (periodIndex) => {
                    const slot = timetableData[day]?.[periodIndex];
                    let cellHtml = `<td class="p-2 border timetable-cell ${slot ? 'hover:bg-indigo-50' : 'bg-gray-50'}" data-day="${day}" data-period="${periodIndex}">`;
                    if (slot) {
                        cellHtml += `<div class="text-sm">
                            <p class="font-bold text-indigo-700">${slot.course}</p>
                            <p class="text-gray-600">${slot.faculty}</p>
                            <p class="text-xs text-gray-500">${slot.room}</p>
                        </div>`;
                        if (['Administrator', 'HOD'].includes(userData.role)) {
                            cellHtml += `<button class="edit-btn p-1 bg-white rounded-full shadow hover:bg-gray-200" data-dept="${deptId}" data-year="${yearId}" data-section="${sectionId}"><i data-lucide="pencil" class="w-3 h-3 text-gray-600"></i></button>`;
                        }
                    } else {
                        cellHtml += `-`;
                    }
                    cellHtml += `</td>`;
                    return cellHtml;
                };

                // Manually build the row with breaks
                tableHtml += renderSlot(0); // Period 1
                tableHtml += renderSlot(1); // Period 2
                tableHtml += `<td class="p-2 border bg-green-100 align-middle text-xs text-green-700 font-semibold">B<br>R<br>E<br>A<br>K</td>`; // Break 1
                tableHtml += renderSlot(2); // Period 3
                tableHtml += renderSlot(3); // Period 4
                tableHtml += `<td class="p-2 border bg-amber-100 align-middle text-xs text-amber-700 font-semibold">L<br>U<br>N<br>C<br>H</td>`; // Lunch
                tableHtml += renderSlot(4); // Period 5
                tableHtml += renderSlot(5); // Period 6
                 tableHtml += `<td class="p-2 border bg-green-100 align-middle text-xs text-green-700 font-semibold">B<br>R<br>E<br>A<br>K</td>`; // Break 2
                tableHtml += renderSlot(6); // Period 7
                

                tableHtml += `</tr>`;
            });

            tableHtml += `</tbody></table>`;
            timetableOutput.innerHTML = tableHtml;
            lucide.createIcons();
            
            // Add event listeners for edit buttons
            timetableOutput.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cell = e.currentTarget.closest('.timetable-cell');
                    const day = cell.dataset.day;
                    const period = parseInt(cell.dataset.period);
                    const dept = btn.dataset.dept;
                    const year = btn.dataset.year;
                    const section = btn.dataset.section;
                    const slotData = MOCK_DB[dept].years[year].sections[section].timetable[day][period];
                    showEditModal(dept, year, section, day, period, slotData);
                });
            });
        }
        
        // --- Modals ---
        
        function showEditModal(deptId, yearId, sectionId, day, period, slotData) {
            const dept = MOCK_DB[deptId];
            const courseOptions = dept.courses.map(c => `<option value="${c.name}" ${slotData.course === c.name ? 'selected' : ''}>${c.name}</option>`).join('');
            const facultyOptions = dept.faculty.map(f => `<option value="${f.name}" ${slotData.faculty === f.name ? 'selected' : ''}>${f.name}</option>`).join('');
            const roomOptions = dept.rooms.map(r => `<option value="${r.name}" ${slotData.room === r.name ? 'selected' : ''}>${r.name}</option>`).join('');

            editModalContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4">
                    <div class="p-6 border-b flex justify-between items-center">
                        <h3 class="text-xl font-bold">Edit Timetable Slot</h3>
                        <button id="close-edit-modal" class="p-1 hover:bg-gray-200 rounded-full"><i data-lucide="x"></i></button>
                    </div>
                    <div class="p-6">
                        <p class="mb-4 text-gray-600">Editing slot for <strong>${day}, Period ${period + 1}</strong></p>
                        <form id="edit-slot-form" class="space-y-4">
                            <div><label class="block text-sm font-medium">Course</label><select name="course" class="form-input w-full mt-1 rounded-lg">${courseOptions}</select></div>
                            <div><label class="block text-sm font-medium">Faculty</label><select name="faculty" class="form-input w-full mt-1 rounded-lg">${facultyOptions}</select></div>
                            <div><label class="block text-sm font-medium">Room</label><select name="room" class="form-input w-full mt-1 rounded-lg">${roomOptions}</select></div>
                            <div class="flex justify-end items-center gap-4 pt-4">
                                <button type="button" id="ai-suggest-btn" class="btn-secondary text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"><i data-lucide="sparkles" class="w-4 h-4"></i> AI Suggest Swap</button>
                                <button type="submit" class="btn-primary text-white font-bold py-2 px-6 rounded-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            editModalContainer.classList.remove('hidden');
            lucide.createIcons();
            
            document.getElementById('close-edit-modal').onclick = () => editModalContainer.classList.add('hidden');
            document.getElementById('ai-suggest-btn').onclick = () => showAISuggestionModal(deptId, yearId, sectionId, day, period);

            document.getElementById('edit-slot-form').onsubmit = (e) => {
                e.preventDefault();
                const form = e.target;
                const newSlotData = {
                    course: form.course.value,
                    faculty: form.faculty.value,
                    room: form.room.value,
                };
                MOCK_DB[deptId].years[yearId].sections[sectionId].timetable[day][period] = newSlotData;
                saveState();
                editModalContainer.classList.add('hidden');
                renderTimetable(deptId, yearId, sectionId);
            };
        }
        
        async function showAISuggestionModal(deptId, yearId, sectionId, day, period) {
             aiSuggestionModalContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 text-center">
                    <svg class="animate-spin h-8 w-8 text-primary-color mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <h3 class="text-lg font-semibold">AI is analyzing for optimal swaps...</h3>
                </div>
            `;
            aiSuggestionModalContainer.classList.remove('hidden');
            await new Promise(res => setTimeout(res, 2000)); // Simulate AI thinking
            
            // Find a random different slot to suggest a swap with (for demo purposes)
            const timetable = MOCK_DB[deptId].years[yearId].sections[sectionId].timetable;
            const days = Object.keys(timetable);
            const randomDay = days[Math.floor(Math.random() * days.length)];
            const randomPeriod = Math.floor(Math.random() * timetable[randomDay].length);
            const swapSlot = timetable[randomDay][randomPeriod];

            aiSuggestionModalContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4">
                    <div class="p-6 border-b flex justify-between items-center">
                        <h3 class="text-xl font-bold">AI Swap Suggestion</h3>
                        <button id="close-ai-modal" class="p-1 hover:bg-gray-200 rounded-full"><i data-lucide="x"></i></button>
                    </div>
                    <div class="p-6">
                        <p class="mb-4">To optimize faculty workload, we suggest swapping this slot with:</p>
                        <div class="bg-gray-100 p-4 rounded-lg mb-4">
                            <p><strong>${randomDay}, Period ${randomPeriod + 1}</strong></p>
                            <p>${swapSlot.course} with ${swapSlot.faculty}</p>
                        </div>
                        <div class="flex justify-end gap-3">
                            <button id="reject-swap" class="bg-gray-200 font-semibold py-2 px-4 rounded-lg">Reject</button>
                            <button id="accept-swap" class="btn-primary text-white font-bold py-2 px-4 rounded-lg">Accept Swap</button>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            
            document.getElementById('close-ai-modal').onclick = () => aiSuggestionModalContainer.classList.add('hidden');
            document.getElementById('reject-swap').onclick = () => aiSuggestionModalContainer.classList.add('hidden');
            document.getElementById('accept-swap').onclick = () => {
                const originalSlot = MOCK_DB[deptId].years[yearId].sections[sectionId].timetable[day][period];
                MOCK_DB[deptId].years[yearId].sections[sectionId].timetable[day][period] = swapSlot;
                MOCK_DB[deptId].years[yearId].sections[sectionId].timetable[randomDay][randomPeriod] = originalSlot;
                saveState();
                aiSuggestionModalContainer.classList.add('hidden');
                editModalContainer.classList.add('hidden');
                renderTimetable(deptId, yearId, sectionId);
            };
        }

        async function showAIAnalysisModal(timetableData) {
            aiAnalysisModalContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4 p-6 text-center">
                    <svg class="animate-spin h-8 w-8 text-secondary-color mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <h3 class="text-lg font-semibold">AI is analyzing the timetable...</h3>
                </div>
            `;
            aiAnalysisModalContainer.classList.remove('hidden');
            await new Promise(res => setTimeout(res, 2000));

            // Basic analysis simulation
            let facultyLoad = {};
            let labCount = 0;
            if (timetableData) {
                Object.values(timetableData).flat().forEach(slot => {
                    if(slot){
                        facultyLoad[slot.faculty] = (facultyLoad[slot.faculty] || 0) + 1;
                        if(slot.course.toLowerCase().includes('lab')) labCount++;
                    }
                });
            }
            const busiestFaculty = Object.keys(facultyLoad).length > 0 ? Object.entries(facultyLoad).sort((a,b) => b[1] - a[1])[0] : ['N/A', 0];

             aiAnalysisModalContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl m-4">
                     <div class="p-6 border-b flex justify-between items-center">
                        <h3 class="text-xl font-bold">AI Timetable Analysis</h3>
                        <button id="close-analysis-modal" class="p-1 hover:bg-gray-200 rounded-full"><i data-lucide="x"></i></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                           <i data-lucide="check-circle-2" class="text-green-600 w-5 h-5 mt-1"></i>
                           <div><strong class="text-green-800">Even Distribution:</strong> Class hours seem well-distributed across the week, avoiding consecutive long days.</div>
                        </div>
                        <div class="flex items-start gap-3 bg-amber-50 p-3 rounded-lg">
                           <i data-lucide="alert-triangle" class="text-amber-600 w-5 h-5 mt-1"></i>
                           <div><strong class="text-amber-800">Faculty Workload:</strong> ${busiestFaculty[0]} has the highest load with ${busiestFaculty[1]} classes. Consider re-assigning one class to balance the workload.</div>
                        </div>
                        <div class="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                           <i data-lucide="info" class="text-blue-600 w-5 h-5 mt-1"></i>
                           <div><strong class="text-blue-800">Resource Utilization:</strong> There are ${labCount} lab sessions scheduled. Ensure all necessary equipment is available and maintained.</div>
                        </div>
                        <div class="flex justify-end mt-4">
                            <button id="close-analysis-modal-2" class="btn-primary text-white font-semibold py-2 px-6 rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
            document.getElementById('close-analysis-modal').onclick = () => aiAnalysisModalContainer.classList.add('hidden');
            document.getElementById('close-analysis-modal-2').onclick = () => aiAnalysisModalContainer.classList.add('hidden');
        }

        function showAttendanceModal(deptId, yearId, sectionId, courseName, day, periodIndex) {
            const dept = MOCK_DB[deptId];
            const year = dept.years[yearId];
            const className = `${dept.short} ${year.name} - Sec ${sectionId}`;

            // In a real app, you would fetch the student list for this class. Here, we simulate it.
            const mockStudents = [
                'Olivia Chen', 'Benjamin Carter', 'Sophia Rodriguez', 'Liam Goldberg', 'Ava Nguyen'
            ];
            const studentListHtml = mockStudents.map((student, index) => `
                <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <label for="student-${index}" class="text-gray-700">${student}</label>
                    <input type="checkbox" id="student-${index}" class="h-5 w-5 rounded text-primary-color focus:ring-primary-color" checked>
                </div>
            `).join('');

            attendanceModalContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl m-4">
                    <div class="p-6 border-b flex justify-between items-center">
                        <div>
                            <h3 class="text-xl font-bold">Mark Attendance</h3>
                            <p class="text-sm text-gray-500">${courseName} | ${className}</p>
                        </div>
                        <button id="close-attendance-modal" class="p-1 hover:bg-gray-200 rounded-full"><i data-lucide="x"></i></button>
                    </div>
                    <div class="p-6">
                        <div class="space-y-2 max-h-80 overflow-y-auto pr-2">
                           ${studentListHtml}
                        </div>
                        <div class="flex justify-end items-center gap-4 pt-6">
                            <button id="submit-attendance-btn" class="btn-primary text-white font-bold py-2 px-6 rounded-lg">Submit Attendance</button>
                        </div>
                    </div>
                </div>
            `;
            attendanceModalContainer.classList.remove('hidden');
            lucide.createIcons();

            document.getElementById('close-attendance-modal').onclick = () => attendanceModalContainer.classList.add('hidden');
            document.getElementById('submit-attendance-btn').onclick = () => {
                // Find the slot in the database and mark attendance as submitted
                const timetableSlot = MOCK_DB[deptId]?.years?.[yearId]?.sections?.[sectionId]?.timetable?.[day]?.[periodIndex];
                if (timetableSlot) {
                    timetableSlot.attendanceSubmitted = true;
                    saveState();
                }

                attendanceModalContainer.classList.add('hidden');
                
                // Refresh the dashboard to show the updated status
                renderFacultyDashboard();

                // Show a temporary success message
                const statusEl = document.getElementById('generation-status');
                statusEl.textContent = `Attendance for ${courseName} submitted successfully.`;
                setTimeout(() => statusEl.textContent = '', 4000);
            };
        }


        // Creates a realistic, hardcoded timetable for the image upload simulation
        function createSimulatedTimetableFromImage(deptId) {
            const deptData = MOCK_DB[deptId];
            if (!deptData || deptData.courses.length === 0 || deptData.faculty.length === 0 || deptData.rooms.length === 0) {
                // Fallback to random if data is insufficient
                return GA_createRandomTimetable(deptId);
            }

            const theoryCourses = deptData.courses.filter(c => c.type === 'Theory');
            const labCourses = deptData.courses.filter(c => c.type === 'Lab');
            const theoryRooms = deptData.rooms.filter(r => r.type === 'Theory');
            const labRooms = deptData.rooms.filter(r => r.type === 'Lab');

            const assign = (courses, rooms, faculty, count) => {
                if (courses.length === 0 || rooms.length === 0 || faculty.length === 0) return null;
                return {
                    course: courses[count % courses.length].name,
                    room: rooms[count % rooms.length].name,
                    faculty: faculty[count % faculty.length].name
                };
            };

            const newTimetable = {
                "Monday": [
                    assign(theoryCourses, theoryRooms, deptData.faculty, 0),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 1),
                    null,
                    assign(labCourses, labRooms, deptData.faculty, 0),
                    assign(labCourses, labRooms, deptData.faculty, 0),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 2),
                    null,
                    null
                ],
                "Tuesday": [
                    assign(labCourses, labRooms, deptData.faculty, 1),
                    assign(labCourses, labRooms, deptData.faculty, 1),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 3),
                    null,
                    assign(theoryCourses, theoryRooms, deptData.faculty, 0),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 1),
                    null,
                    null
                ],
                "Wednesday": [
                    assign(theoryCourses, theoryRooms, deptData.faculty, 2),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 3),
                    null,
                    assign(theoryCourses, theoryRooms, deptData.faculty, 4),
                    assign(labCourses, labRooms, deptData.faculty, 2),
                    assign(labCourses, labRooms, deptData.faculty, 2),
                    null,
                    null
                ],
                "Thursday": [
                    assign(theoryCourses, theoryRooms, deptData.faculty, 1),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 0),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 2),
                    null,
                    assign(labCourses, labRooms, deptData.faculty, 0),
                    assign(labCourses, labRooms, deptData.faculty, 0),
                    null,
                    null
                ],
                "Friday": [
                    assign(theoryCourses, theoryRooms, deptData.faculty, 3),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 4),
                    null,
                    null, 
                    assign(theoryCourses, theoryRooms, deptData.faculty, 0),
                    null,
                    null,
                    null
                ],
                "Saturday": [
                    assign(theoryCourses, theoryRooms, deptData.faculty, 1),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 0),
                    assign(theoryCourses, theoryRooms, deptData.faculty, 2),
                    null,
                    assign(labCourses, labRooms, deptData.faculty, 0),
                    assign(labCourses, labRooms, deptData.faculty, 0),
                    null,
                    null
                ]
            };
            return newTimetable;
        }

        function setupUploadModal() {
             uploadTimetableBtn.addEventListener('click', () => {
                 uploadModalContainer.innerHTML = `
                 <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4">
                     <div class="p-6 border-b flex justify-between items-center">
                         <h3 class="text-xl font-bold">Upload and Process Timetable</h3>
                         <button id="close-upload-modal" class="p-1 hover:bg-gray-200 rounded-full"><i data-lucide="x"></i></button>
                     </div>
                     <div class="p-8 text-center">
                         <div id="drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-10 relative transition-colors">
                              <div id="upload-prompt">
                                <i data-lucide="image-plus" class="w-16 h-16 text-gray-400 mx-auto"></i>
                                <p class="mt-4 text-gray-600">Drag & drop your image here, or click to browse.</p>
                              </div>
                              <div id="upload-status" class="hidden"></div>
                              <input type="file" id="file-input" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" accept="image/png, image/jpeg, image/jpg">
                         </div>
                         <p class="text-sm text-gray-400 mt-4">The AI will attempt to parse the uploaded timetable image.</p>
                     </div>
                 </div>
                 `;
                 uploadModalContainer.classList.remove('hidden');
                 lucide.createIcons();

                 const dropZone = document.getElementById('drop-zone');
                 const fileInput = document.getElementById('file-input');
                 const uploadPrompt = document.getElementById('upload-prompt');
                 const uploadStatus = document.getElementById('upload-status');

                 document.getElementById('close-upload-modal').onclick = () => uploadModalContainer.classList.add('hidden');
                 
                 const highlight = () => dropZone.classList.add('border-primary-color', 'bg-indigo-50');
                 const unhighlight = () => dropZone.classList.remove('border-primary-color', 'bg-indigo-50');

                 dropZone.addEventListener('dragenter', (e) => { e.preventDefault(); e.stopPropagation(); highlight(); });
                 dropZone.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); highlight(); });
                 dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); unhighlight(); });
                 dropZone.addEventListener('drop', (e) => {
                     e.preventDefault();
                     e.stopPropagation();
                     unhighlight();
                     const files = e.dataTransfer.files;
                     if (files.length > 0) {
                         handleFile(files[0]);
                     }
                 });

                 fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handleFile(e.target.files[0]);
                    }
                 });

                function handleFile(file) {
                    if (!file.type.startsWith('image/')) {
                        uploadStatus.innerHTML = `<p class="text-red-500 font-semibold">Error: Please upload an image file.</p>`;
                        uploadPrompt.classList.add('hidden');
                        uploadStatus.classList.remove('hidden');
                        return;
                    }

                    uploadPrompt.classList.add('hidden');
                    uploadStatus.classList.remove('hidden');
                    uploadStatus.innerHTML = `
                        <p class="font-semibold text-gray-700">${file.name}</p>
                        <div class="mt-4 flex items-center justify-center text-blue-600">
                           <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           <span>Processing with AI...</span>
                        </div>
                    `;

                    // Simulate AI processing and update timetable
                    setTimeout(() => {
                        let deptId, yearId, sectionId;
                        
                        // Get the currently selected timetable context from the hub selectors
                        const yearSelect = document.getElementById('hub-year-select');
                        const sectionSelect = document.getElementById('hub-section-select');
                        
                        if (userData.role === 'Administrator') {
                            const deptSelect = document.getElementById('hub-dept-select');
                            deptId = deptSelect?.value;
                        } else { // HOD
                            deptId = userData.departmentId;
                        }
                        yearId = yearSelect?.value;
                        sectionId = sectionSelect?.value;

                        if (!deptId || !yearId || !sectionId) {
                            uploadStatus.innerHTML = `
                                <div class="text-red-600 flex flex-col items-center justify-center">
                                    <i data-lucide="alert-circle" class="w-16 h-16"></i>
                                    <p class="mt-4 font-semibold">Import Failed!</p>
                                    <p class="text-sm text-gray-500">Please select a department, year, and section on the dashboard before uploading.</p>
                                </div>`;
                            lucide.createIcons();
                            return;
                        }
                        
                        // Generate a new PREDEFINED timetable to simulate it being parsed from the image
                        const newTimetable = createSimulatedTimetableFromImage(deptId);
                        MOCK_DB[deptId].years[yearId].sections[sectionId].timetable = newTimetable;
                        saveState();
                        
                        // Render the new timetable on the main dashboard
                        renderTimetable(deptId, yearId, sectionId);
                        
                        // Show success message and close modal
                        uploadStatus.innerHTML = `
                            <div class="text-green-600 flex flex-col items-center justify-center">
                                <i data-lucide="check-circle-2" class="w-16 h-16"></i>
                                <p class="mt-4 font-semibold">Timetable processed successfully!</p>
                                <p class="text-sm text-gray-500">The new timetable is now active.</p>
                            </div>
                         `;
                         lucide.createIcons();

                         setTimeout(() => {
                             uploadModalContainer.classList.add('hidden');
                             generationStatus.textContent = 'Timetable successfully imported from image.';
                             setTimeout(() => generationStatus.textContent = '', 4000);
                         }, 2000);

                    }, 2500);
                 }
              });
        }
        
        // --- AI Chat Widget ---
        function setupChatWidget() {
            const openBtn = document.getElementById('open-chat-btn');
            const closeBtn = document.getElementById('close-chat-btn');
            const widget = document.getElementById('ai-chat-widget');
            const chatForm = document.getElementById('chat-form');
            const chatInput = document.getElementById('chat-input');
            const chatMessages = document.getElementById('chat-messages');

            openBtn.addEventListener('click', () => {
                widget.classList.remove('opacity-0', 'translate-y-[calc(100%+20px)]');
            });
            closeBtn.addEventListener('click', () => {
                widget.classList.add('opacity-0', 'translate-y-[calc(100%+20px)]');
            });
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const message = chatInput.value.trim();
                if (!message) return;
                
                appendChatMessage(message, 'user');
                chatInput.value = '';
                
                // Simulate AI response
                setTimeout(() => {
                    const aiResponse = getAIResponse(message);
                    appendChatMessage(aiResponse, 'ai');
                }, 1000);
            });

            function appendChatMessage(text, sender) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
                messageDiv.innerHTML = `
                    <div class="chat-bubble ${sender === 'user' ? 'bg-primary-color text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'} p-3 rounded-xl shadow-sm">
                        ${text}
                    </div>
                `;
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            function getAIResponse(query) {
                query = query.toLowerCase();
                if (query.includes("generate") || query.includes("create timetable")) {
                    return "To generate a timetable, select a department, year, and section from the dropdowns in the hub, then click the 'Generate New' button in the 'Timetable Generation Tools' section.";
                } else if (query.includes("edit") || query.includes("change")) {
                    return "You can edit a timetable slot by hovering over it and clicking the pencil icon. This feature is available for HODs and Administrators.";
                } else if (query.includes("my schedule") || query.includes("my classes")) {
                    return "If you are a faculty member, your daily schedule is displayed on your dashboard. If you are a student, you can view your class timetable by selecting your department, year, and section.";
                } else {
                    return "I can help with questions about generating, editing, and viewing timetables. How can I assist you further?";
                }
            }
        }
