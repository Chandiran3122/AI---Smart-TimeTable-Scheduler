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
            const periods = 8;
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
