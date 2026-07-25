// IronTracker — Static Data
// Loaded before the main script.

const EXERCISE_DATABASE = {
  'Chest':['Barbell Bench Press','Incline Barbell Press','Decline Barbell Press','Incline Dumbbell Press','Decline Dumbbell Press','Flat Dumbbell Press','Cable Chest Fly','Pec Deck Machine','Dumbbell Fly','Push-ups','Dips (Chest Focus)','Cable Crossover','Machine Chest Press','Landmine Press'],
  'Back':['Deadlift','Barbell Row','Pendlay Row','Seated Cable Row','Single-Arm Dumbbell Row','T-Bar Row','Lat Pulldown','Weighted Pull-ups','Pull-ups','Chin-ups','Face Pulls','Straight-Arm Pulldown','Rack Pulls','Hyperextensions','Meadows Row'],
  'Shoulders':['Barbell Overhead Press','Dumbbell Shoulder Press','Arnold Press','Lateral Raises','Front Raises','Rear Delt Fly','Cable Lateral Raise','Cable Upright Row','Barbell Upright Row','Machine Shoulder Press','Landmine Press','Pike Push-ups'],
  'Biceps':['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl','Concentration Curl','Incline Dumbbell Curl','EZ-Bar Curl','Spider Curl','21s'],
  'Triceps':['Close-Grip Bench Press','Tricep Rope Pushdown','Overhead Tricep Extension','Skull Crushers','Dips (Tricep Focus)','Cable Tricep Kickback','Diamond Push-ups','Single-Arm Overhead Extension'],
  'Quads':['Barbell Back Squat','Front Squat','Leg Press','Leg Extension','Walking Lunges','Bulgarian Split Squat','Hack Squat','Goblet Squat','Step-ups','Sissy Squat'],
  'Hamstrings/Glutes':['Romanian Deadlift','Seated Leg Curl','Lying Leg Curl','Hip Thrust','Glute Bridge','Good Mornings','Single-Leg RDL','Cable Pull-Through','Glute Kickback'],
  'Calves':['Standing Calf Raises','Seated Calf Raises','Leg Press Calf Raise','Donkey Calf Raise'],
  'Core/Abs':['Plank','Hanging Leg Raises','Ab Wheel Rollout','Cable Crunch','Russian Twists','Bicycle Crunches','Hanging Knee Raises','Sit-ups','Side Plank','Dead Bug','Pallof Press'],
  'Full Body/HIIT':['Kettlebell Swings','Box Jumps','Battle Ropes','Burpees','Sled Push','Sled Pull','Wall Balls','Thrusters','Clean and Press',"Farmer's Carry",'Rowing Machine','Assault Bike']
};

const EXERCISE_DB_DEFAULT_TARGETS = {
  'Chest':{sets:3,reps:'10-12'},'Back':{sets:4,reps:'8-10'},'Shoulders':{sets:3,reps:'10-12'},
  'Biceps':{sets:3,reps:'10-12'},'Triceps':{sets:3,reps:'10-12'},'Quads':{sets:4,reps:'8-12'},
  'Hamstrings/Glutes':{sets:3,reps:'10-12'},'Calves':{sets:4,reps:'15-20'},'Core/Abs':{sets:3,reps:'12-15'},
  'Full Body/HIIT':{sets:5,reps:'40 sec'}
};

const EXERCISE_MEDIA = {
  'Barbell Bench Press':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benchpress.png/320px-Benchpress.png',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=vcBig73ojpE',videoLabel:'How to Bench Press (ATHLEAN-X)',muscles:'Chest, Triceps, Front Deltoids',tips:['Retract your shoulder blades and keep them pinched','Bar should touch mid-chest, not neck','Drive feet into the floor for stability']},
  'Incline Barbell Press':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Incline_bench_press.jpg/320px-Incline_bench_press.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=DbFgADa2PL8',videoLabel:'Incline Bench Press (Jeff Nippard)',muscles:'Upper Chest, Triceps, Shoulders',tips:['Set bench to 30-45°','Keep elbows at 75° to avoid shoulder strain','Control the descent']},
  'Deadlift':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Conventional_deadlift.png/320px-Conventional_deadlift.png',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=op9kVnSso6Q',videoLabel:'How to Deadlift (ATHLEAN-X)',muscles:'Hamstrings, Glutes, Lower Back, Traps',tips:['Bar stays in contact with legs throughout','Hinge at hips first, then bend knees','Keep chest tall and core braced']},
  'Barbell Row':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bent_over_row.jpg/320px-Bent_over_row.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=G8l_8chR5BE',videoLabel:'Barbell Row Technique (Jeff Nippard)',muscles:'Lats, Rhomboids, Biceps, Rear Delts',tips:['Hinge to ~45°, spine neutral','Pull bar to lower chest/upper abs','Squeeze shoulder blades at top']},
  'Barbell Back Squat':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Squat_performance.jpg/320px-Squat_performance.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=ultWZbUMPL8',videoLabel:'How to Squat (ATHLEAN-X)',muscles:'Quads, Glutes, Hamstrings, Core',tips:['Feet shoulder-width, toes slightly out','Break at hips and knees simultaneously','Keep chest tall, knees tracking over toes']},
  'Barbell Overhead Press':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/OHP.jpg/320px-OHP.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=2yjwXTZQDDI',videoLabel:'Overhead Press Tutorial (Jeff Nippard)',muscles:'Shoulders, Triceps, Upper Chest',tips:['Grip just outside shoulder width','Bar starts at collarbone, push straight up','Squeeze glutes to protect lower back']},
  'Pull-ups':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Kipping_Pull_Up.jpg/320px-Kipping_Pull_Up.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=eGo4IYlbE5g',videoLabel:'How to Do Pull-Ups (ATHLEAN-X)',muscles:'Lats, Biceps, Rear Delts',tips:['Full dead hang at bottom','Pull elbows to hips, not just chin to bar','Avoid kipping for strength work']},
  'Romanian Deadlift':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Romanian_Deadlift.jpg/320px-Romanian_Deadlift.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=JCXUYuzwNrM',videoLabel:'Romanian Deadlift Form (Jeff Nippard)',muscles:'Hamstrings, Glutes, Lower Back',tips:['Soft knee bend throughout, hinge at hips','Bar stays close to legs — no swinging','Feel the hamstring stretch at bottom']},
  'Barbell Curl':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Barbell_curl.jpg/320px-Barbell_curl.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=kwG2ipFRgfo',videoLabel:'Barbell Curl Technique (ATHLEAN-X)',muscles:'Biceps, Forearms',tips:['Elbows pinned to sides','Full extension at bottom, full squeeze at top','No swinging or body momentum']},
  'Lateral Raises':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Lateral_raise.jpg/320px-Lateral_raise.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=3VcKaXpzqRo',videoLabel:'Lateral Raise Tutorial (Jeff Nippard)',muscles:'Side Deltoids',tips:['Lead with elbows, not wrists','Slight forward lean for better activation','Control the descent — 2-3 seconds down']},
  'Hip Thrust':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Barbell_hip_thrust.jpg/320px-Barbell_hip_thrust.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=SEdqd1n0cvg',videoLabel:'Hip Thrust Form (ATHLEAN-X)',muscles:'Glutes, Hamstrings',tips:['Upper back on bench, bar across hips','Drive through heels, squeeze glutes at top','Full hip extension — do not hyperextend lower back']},
  'Plank':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Front_plank.jpg/320px-Front_plank.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=pSHjTRCQxIw',videoLabel:'Plank Variations (Jeff Nippard)',muscles:'Core, Shoulders, Glutes',tips:['Squeeze glutes and abs simultaneously','Hips level — do not sag or pike','Breathe steadily, do not hold breath']},
  'Tricep Rope Pushdown':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Tricep_pushdown.jpg/320px-Tricep_pushdown.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=-nt-t7p9YzU',videoLabel:'Rope Pushdown Tutorial (ATHLEAN-X)',muscles:'Triceps',tips:['Elbows locked at sides throughout','Split rope apart at bottom for peak contraction','Control the return — do not let weight fly up']},
  'Leg Press':{img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Leg_press.jpg/320px-Leg_press.jpg',imgCredit:'Wikimedia Commons',video:'https://www.youtube.com/watch?v=IZxyjW7MPJQ',videoLabel:'Leg Press Technique (Jeff Nippard)',muscles:'Quads, Glutes, Hamstrings',tips:['Do not lock knees out at top','Feet higher = more glute and hamstring','Keep lower back pressed into pad throughout']},
};

const EXERCISE_IMG_FALLBACK = {
  'Chest':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benchpress.png/200px-Benchpress.png',
  'Back':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bent_over_row.jpg/200px-Bent_over_row.jpg',
  'Shoulders':'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Lateral_raise.jpg/200px-Lateral_raise.jpg',
  'Biceps':'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Barbell_curl.jpg/200px-Barbell_curl.jpg',
  'Triceps':'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Tricep_pushdown.jpg/200px-Tricep_pushdown.jpg',
  'Quads':'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Squat_performance.jpg/200px-Squat_performance.jpg',
  'Hamstrings/Glutes':'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Romanian_Deadlift.jpg/200px-Romanian_Deadlift.jpg',
  'Calves':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Benchpress.png/200px-Benchpress.png',
  'Core/Abs':'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Front_plank.jpg/200px-Front_plank.jpg',
  'Full Body/HIIT':'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Squat_performance.jpg/200px-Squat_performance.jpg',
};

const SPLIT_PRESETS = {
  iron24_5day:{
    label:'Iron24 5-Day (Chest/Back/Legs/Shoulders/HIIT)',
    days:[
      {name:'Chest + Triceps',focus:'Hypertrophy',exercises:[
        {name:'Barbell Bench Press',target:'4 × 6-8',sets:4},{name:'Incline Dumbbell Press',target:'3 × 10-12',sets:3},
        {name:'Cable Chest Fly',target:'3 × 12-15',sets:3},{name:'Close-Grip Bench Press',target:'3 × 8-10',sets:3},
        {name:'Tricep Rope Pushdown',target:'3 × 12-15',sets:3},{name:'Overhead Tricep Extension',target:'3 × 12',sets:3},
        {name:'Push-up Burnout',target:'2 × failure',sets:2}]},
      {name:'Back + Biceps',focus:'Strength',exercises:[
        {name:'Deadlift',target:'4 × 5',sets:4},{name:'Weighted Pull-ups',target:'4 × 6-8',sets:4},
        {name:'Seated Cable Row',target:'3 × 10-12',sets:3},{name:'Single-Arm DB Row',target:'3 × 10 each',sets:3},
        {name:'Barbell Curl',target:'3 × 10-12',sets:3},{name:'Hammer Curl',target:'3 × 12',sets:3},
        {name:'Face Pulls',target:'3 × 15',sets:3}]},
      {name:'Legs',focus:'Quads + Glutes',exercises:[
        {name:'Barbell Back Squat',target:'4 × 6-8',sets:4},{name:'Romanian Deadlift',target:'3 × 10-12',sets:3},
        {name:'Leg Press',target:'3 × 12-15',sets:3},{name:'Walking Lunges',target:'3 × 12 each',sets:3},
        {name:'Leg Extension',target:'3 × 15',sets:3},{name:'Seated Leg Curl',target:'3 × 15',sets:3},
        {name:'Standing Calf Raises',target:'4 × 20',sets:4}]},
      {name:'Shoulders + Core',focus:'Power + Core',exercises:[
        {name:'Barbell Overhead Press',target:'4 × 6-8',sets:4},{name:'Arnold Press',target:'3 × 10-12',sets:3},
        {name:'Lateral Raises',target:'4 × 15',sets:4},{name:'Rear Delt Fly',target:'3 × 15',sets:3},
        {name:'Cable Upright Row',target:'3 × 12',sets:3},{name:'Hanging Leg Raises',target:'3 × 15',sets:3},
        {name:'Ab Wheel Rollout',target:'3 × 12',sets:3},{name:'Plank',target:'3 × 45 sec',sets:3}]},
      {name:'HIIT + Full Body',focus:'Metabolic Burn',exercises:[
        {name:'Kettlebell Swings',target:'5 × 40 sec',sets:5},{name:'Box Jumps',target:'5 × 40 sec',sets:5},
        {name:'Battle Ropes',target:'5 × 40 sec',sets:5},{name:'Burpees',target:'5 × 40 sec',sets:5},
        {name:'Sled Push',target:'5 × 40 sec',sets:5},{name:'Goblet Squat',target:'3 × 15',sets:3},
        {name:'Push-ups',target:'3 × 15',sets:3},{name:'Dumbbell Row',target:'3 × 12 each',sets:3}]}
    ]
  },
  ppl:{
    label:'Push / Pull / Legs (PPL)',
    days:[
      {name:'Push Day',focus:'Chest, Shoulders, Triceps',exercises:[
        {name:'Barbell Bench Press',target:'4 × 6-8',sets:4},{name:'Overhead Press',target:'4 × 6-8',sets:4},
        {name:'Incline Dumbbell Press',target:'3 × 10-12',sets:3},{name:'Lateral Raises',target:'3 × 15',sets:3},
        {name:'Tricep Rope Pushdown',target:'3 × 12-15',sets:3},{name:'Overhead Tricep Extension',target:'3 × 12',sets:3}]},
      {name:'Pull Day',focus:'Back, Biceps',exercises:[
        {name:'Deadlift',target:'4 × 5',sets:4},{name:'Weighted Pull-ups',target:'4 × 6-8',sets:4},
        {name:'Barbell Row',target:'4 × 8-10',sets:4},{name:'Seated Cable Row',target:'3 × 10-12',sets:3},
        {name:'Barbell Curl',target:'3 × 10-12',sets:3},{name:'Hammer Curl',target:'3 × 12',sets:3}]},
      {name:'Leg Day',focus:'Quads, Hamstrings, Glutes',exercises:[
        {name:'Barbell Back Squat',target:'4 × 6-8',sets:4},{name:'Romanian Deadlift',target:'3 × 10-12',sets:3},
        {name:'Leg Press',target:'3 × 12-15',sets:3},{name:'Walking Lunges',target:'3 × 12 each',sets:3},
        {name:'Leg Curl',target:'3 × 15',sets:3},{name:'Standing Calf Raises',target:'4 × 20',sets:4}]}
    ]
  },
  upper_lower:{
    label:'Upper / Lower Split',
    days:[
      {name:'Upper Body A',focus:'Strength',exercises:[
        {name:'Barbell Bench Press',target:'4 × 6-8',sets:4},{name:'Barbell Row',target:'4 × 6-8',sets:4},
        {name:'Overhead Press',target:'3 × 8-10',sets:3},{name:'Lat Pulldown',target:'3 × 10-12',sets:3},
        {name:'Barbell Curl',target:'3 × 10-12',sets:3},{name:'Tricep Pushdown',target:'3 × 12-15',sets:3}]},
      {name:'Lower Body A',focus:'Strength',exercises:[
        {name:'Barbell Back Squat',target:'4 × 6-8',sets:4},{name:'Romanian Deadlift',target:'3 × 8-10',sets:3},
        {name:'Leg Press',target:'3 × 12-15',sets:3},{name:'Leg Curl',target:'3 × 12-15',sets:3},
        {name:'Standing Calf Raises',target:'4 × 15-20',sets:4}]},
      {name:'Upper Body B',focus:'Hypertrophy',exercises:[
        {name:'Incline Dumbbell Press',target:'4 × 10-12',sets:4},{name:'Seated Cable Row',target:'4 × 10-12',sets:4},
        {name:'Lateral Raises',target:'3 × 15',sets:3},{name:'Face Pulls',target:'3 × 15',sets:3},
        {name:'Hammer Curl',target:'3 × 12',sets:3},{name:'Overhead Tricep Extension',target:'3 × 12',sets:3}]},
      {name:'Lower Body B',focus:'Hypertrophy',exercises:[
        {name:'Front Squat',target:'4 × 8-10',sets:4},{name:'Walking Lunges',target:'3 × 12 each',sets:3},
        {name:'Leg Extension',target:'3 × 15',sets:3},{name:'Seated Leg Curl',target:'3 × 15',sets:3},
        {name:'Seated Calf Raises',target:'4 × 20',sets:4}]}
    ]
  },
  bro_split:{
    label:'Classic Bro Split (5-Day)',
    days:[
      {name:'Chest Day',focus:'Hypertrophy',exercises:[
        {name:'Barbell Bench Press',target:'4 × 6-8',sets:4},{name:'Incline Dumbbell Press',target:'4 × 10-12',sets:4},
        {name:'Cable Chest Fly',target:'3 × 12-15',sets:3},{name:'Dips',target:'3 × failure',sets:3}]},
      {name:'Back Day',focus:'Hypertrophy',exercises:[
        {name:'Deadlift',target:'4 × 5',sets:4},{name:'Weighted Pull-ups',target:'4 × 8-10',sets:4},
        {name:'Barbell Row',target:'4 × 10-12',sets:4},{name:'Seated Cable Row',target:'3 × 12-15',sets:3}]},
      {name:'Shoulder Day',focus:'Hypertrophy',exercises:[
        {name:'Overhead Press',target:'4 × 6-8',sets:4},{name:'Arnold Press',target:'3 × 10-12',sets:3},
        {name:'Lateral Raises',target:'4 × 15',sets:4},{name:'Rear Delt Fly',target:'3 × 15',sets:3}]},
      {name:'Arm Day',focus:'Hypertrophy',exercises:[
        {name:'Barbell Curl',target:'4 × 10-12',sets:4},{name:'Hammer Curl',target:'3 × 12',sets:3},
        {name:'Close-Grip Bench Press',target:'4 × 8-10',sets:4},{name:'Tricep Pushdown',target:'3 × 12-15',sets:3}]},
      {name:'Leg Day',focus:'Hypertrophy',exercises:[
        {name:'Barbell Back Squat',target:'4 × 6-8',sets:4},{name:'Leg Press',target:'4 × 12-15',sets:4},
        {name:'Romanian Deadlift',target:'3 × 10-12',sets:3},{name:'Standing Calf Raises',target:'4 × 20',sets:4}]}
    ]
  },
  full_body:{
    label:'Full Body (3-Day)',
    days:[
      {name:'Full Body A',focus:'Strength',exercises:[
        {name:'Barbell Back Squat',target:'4 × 6-8',sets:4},{name:'Barbell Bench Press',target:'4 × 6-8',sets:4},
        {name:'Barbell Row',target:'4 × 8-10',sets:4},{name:'Plank',target:'3 × 45 sec',sets:3}]},
      {name:'Full Body B',focus:'Strength',exercises:[
        {name:'Deadlift',target:'4 × 5',sets:4},{name:'Overhead Press',target:'4 × 6-8',sets:4},
        {name:'Lat Pulldown',target:'3 × 10-12',sets:3},{name:'Hanging Leg Raises',target:'3 × 15',sets:3}]},
      {name:'Full Body C',focus:'Strength',exercises:[
        {name:'Front Squat',target:'4 × 8-10',sets:4},{name:'Incline Dumbbell Press',target:'3 × 10-12',sets:3},
        {name:'Seated Cable Row',target:'3 × 10-12',sets:3},{name:'Ab Wheel Rollout',target:'3 × 12',sets:3}]}
    ]
  }
};

const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const QUICK_MEALS=[
  {name:'Oats + Eggs (pre-workout)',meal:'Pre-workout',cal:380,protein:28,carbs:45,fat:9},
  {name:'Whey shake + rice cakes',meal:'Post-workout',cal:300,protein:30,carbs:35,fat:3},
  {name:'Grilled chicken + rice + veggies',meal:'Lunch',cal:520,protein:55,carbs:50,fat:8},
  {name:'Greek yogurt + nuts',meal:'Snack',cal:220,protein:18,carbs:12,fat:10},
  {name:'Salmon + salad + sweet potato',meal:'Dinner',cal:480,protein:42,carbs:32,fat:16},
  {name:'Cottage cheese (evening)',meal:'Evening',cal:160,protein:28,carbs:6,fat:2},
];

const PLATE_SIZES=[{w:45,color:'#4d8fd4'},{w:35,color:'#e05c5c'},{w:25,color:'#c9a84c'},{w:10,color:'#4a9e6b'},{w:5,color:'#8a96b0'},{w:2.5,color:'#e8944a'}];

const BADGES=[
  {id:'first_workout',icon:'🏋️',name:'First rep',desc:'Logged your first workout',check:(logs,prs,vol)=>logs.length>=1},
  {id:'ten_workouts',icon:'🔟',name:'10 sessions',desc:'Logged 10 workouts',check:(logs)=>logs.length>=10},
  {id:'fifty_workouts',icon:'💯',name:'50 sessions',desc:'Logged 50 workouts',check:(logs)=>logs.length>=50},
  {id:'hundred_workouts',icon:'🎖️',name:'100 sessions',desc:'Logged 100 workouts',check:(logs)=>logs.length>=100},
  {id:'first_pr',icon:'🏆',name:'First PR',desc:'Set your first personal record',check:(logs,prs)=>prs.length>=1},
  {id:'ten_prs',icon:'🥇',name:'10 PRs',desc:'Set 10 personal records',check:(logs,prs)=>prs.length>=10},
  {id:'hundred_k',icon:'💪',name:'100k club',desc:'Lifted 100,000 lbs total',check:(logs,prs,vol)=>vol>=100000},
  {id:'million',icon:'🚀',name:'Million lb club',desc:'Lifted 1,000,000 lbs total',check:(logs,prs,vol)=>vol>=1000000},
  {id:'streak_7',icon:'🔥',name:'Week warrior',desc:'7-day training streak',check:(logs)=>calcStreak(logs)>=7},
  {id:'streak_30',icon:'📅',name:'30-day grind',desc:'30-day training streak',check:(logs)=>calcStreak(logs)>=30},
];

const CARDIO_TYPES = ['Running','Cycling','Walking','Rowing','Jump Rope','Swimming','Elliptical','Stair Climber','HIIT','Other'];

const MUSCLE_ICONS={'Chest':'🫁','Back':'🔙','Shoulders':'🤸','Biceps':'💪','Triceps':'🦾','Quads':'🦵','Hamstrings/Glutes':'🍑','Calves':'🦴','Core/Abs':'⚡','Full Body/HIIT':'🔥'};

const GOAL_SPLITS={
  build_muscle:{label:'Iron24 5-Day Program',split:'iron24_5day',desc:'Classic hypertrophy split targeting each muscle group with maximum volume.'},
  lose_fat:{label:'Iron24 5-Day Program',split:'iron24_5day',desc:'Strength training preserves muscle while you cut. Combine with cardio for best results.'},
  get_strong:{label:'Upper/Lower Split',split:'upper_lower',desc:'Powerlifting-focused split built around heavy compound movements.'},
  athletic:{label:'Push/Pull/Legs',split:'ppl',desc:'PPL balances pushing, pulling, and leg work for well-rounded athletic performance.'},
  general:{label:'Push/Pull/Legs',split:'ppl',desc:'Balanced program hitting every muscle group with consistent frequency.'},
};


// ── Unit conversion constants ────────────────────────────────
// Use these instead of raw numbers throughout the codebase
const UNITS = {
  ML_PER_OZ:       29.5735,   // millilitres per fluid ounce
  KG_PER_LB:       0.453592,  // kilograms per pound
  CM_PER_INCH:     2.54,      // centimetres per inch
  KCAL_PER_LB_FAT: 3500,      // dietary calories per pound of body fat
};

// Activity multipliers for TDEE (Mifflin-St Jeor)
const ACTIVITY_MULTIPLIERS = {
  sedentary:    1.2,    // desk job, little exercise
  light:        1.375,  // 1-3 days/week
  moderate:     1.55,   // 3-5 days/week
  active:       1.725,  // 6-7 days/week hard training
  very_active:  1.9,    // physical job + training
};
