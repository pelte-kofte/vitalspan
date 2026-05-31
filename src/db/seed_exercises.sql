-- Vitalspan Exercise Library Seed
-- Source: src/data/exercises.ts (60 exercises across 8 categories)
-- Run once via Supabase SQL editor to populate the exercises reference table.
-- All INSERT statements use ON CONFLICT (id) DO NOTHING for idempotency.

CREATE TABLE IF NOT EXISTS exercises (
  id               text PRIMARY KEY,
  name             text NOT NULL,
  category         text NOT NULL,
  body_part        text,
  equipment        text,
  muscle_group     text,
  secondary_muscles text[],
  target           text,
  instructions     text
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON exercises
  FOR SELECT TO anon USING (true);

-- ── Pull / Row ────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0720', 'Side-to-Side Chin', 'Pull / Row', 'back', 'body weight', 'biceps', ARRAY['biceps', 'forearms'], 'lats', 'Stand with your feet shoulder-width apart and your knees slightly bent. Grasp a pull-up bar with an overhand grip, hands slightly wider than shoulder-width apart. Hang from the bar with your arms fully extended and your body relaxed. Pull yourself up by bending your elbows and bringing your chin towards the bar, while keeping your body straight. Once your chin is above the bar, lower yourself back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0095', 'Barbell Shrug', 'Pull / Row', 'back', 'barbell', 'shoulders', ARRAY['shoulders'], 'traps', 'Stand with your feet shoulder-width apart and hold a barbell in front of you with an overhand grip. Keep your arms straight and your back straight throughout the exercise. Lift your shoulders up towards your ears as high as possible, squeezing your traps at the top. Hold for a moment, then slowly lower your shoulders back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1316', 'Barbell Bent Arm Pullover', 'Pull / Row', 'back', 'barbell', 'triceps', ARRAY['triceps', 'chest'], 'lats', 'Lie flat on a bench with your head at one end and your feet on the floor. Hold a barbell with a shoulder-width grip and extend your arms straight above your chest. Lower the barbell behind your head while keeping your arms slightly bent. Pause for a moment, then raise the barbell back to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0292', 'Dumbbell One Arm Bent-Over Row', 'Pull / Row', 'back', 'dumbbell', 'biceps', ARRAY['biceps', 'forearms'], 'upper back', 'Stand with your feet shoulder-width apart, holding a dumbbell in one hand with your palm facing your body. Bend your knees slightly and hinge forward at the hips, keeping your back straight and your core engaged. Let the dumbbell hang straight down towards the floor, with your arm fully extended. Pull the dumbbell up towards your chest, keeping your elbow close to your body and squeezing your shoulder blades together. Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position. Repeat for the desired number of repetitions, then switch sides.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0327', 'Dumbbell Incline Row', 'Pull / Row', 'back', 'dumbbell', 'biceps', ARRAY['biceps', 'shoulders'], 'upper back', 'Set up an incline bench at a 45-degree angle. Grab a dumbbell in each hand and sit on the bench with your chest against the incline. Extend your arms fully, allowing the dumbbells to hang straight down from your shoulders. Pull the dumbbells up towards your chest, squeezing your shoulder blades together. Pause for a moment at the top, then slowly lower the dumbbells back to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0293', 'Dumbbell Bent Over Row', 'Pull / Row', 'back', 'dumbbell', 'biceps', ARRAY['biceps', 'forearms'], 'upper back', 'Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body. Bend forward at the hips, keeping your back straight and your core engaged. Let your arms hang straight down towards the floor, with your elbows slightly bent. Pull the dumbbells up towards your chest, squeezing your shoulder blades together. Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3167', 'Bodyweight Squatting Row (Towel)', 'Pull / Row', 'back', 'body weight', 'biceps', ARRAY['biceps', 'shoulders'], 'upper back', 'Stand with your feet shoulder-width apart, holding a towel in front of you with your palms facing down. Bend your knees and lower your body into a squat position, keeping your back straight and your chest up. As you lower into the squat, simultaneously pull the towel towards your chest, squeezing your shoulder blades together. Pause for a moment at the bottom of the squat, then slowly return to the starting position while extending your arms. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1317', 'Barbell Reverse Grip Incline Row', 'Pull / Row', 'back', 'barbell', 'biceps', ARRAY['biceps', 'forearms'], 'upper back', 'Set up an incline bench at a 45-degree angle. Sit on the bench facing the backrest with your chest against it. Grab the barbell with a reverse grip (palms facing down) and hands slightly wider than shoulder-width apart. Keep your back straight and core engaged. Pull the barbell towards your upper abdomen, squeezing your shoulder blades together. Pause for a moment at the top of the movement. Slowly lower the barbell back to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0794', 'Standing Lateral Stretch', 'Pull / Row', 'back', 'body weight', 'shoulders', ARRAY['shoulders', 'obliques'], 'lats', 'Stand with your feet shoulder-width apart and your knees slightly bent. Extend your arms straight out to the sides, parallel to the ground. Slowly lean your upper body to one side, feeling a stretch in your side and lats. Hold the stretch for 15–30 seconds. Return to the starting position and repeat on the other side. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1773', 'One Arm Towel Row', 'Pull / Row', 'back', 'body weight', 'biceps', ARRAY['biceps', 'forearms'], 'upper back', 'Stand with your feet shoulder-width apart, knees slightly bent, and hold a towel with one hand. Bend forward at the waist, keeping your back straight and your core engaged. Extend your arm fully, allowing the towel to hang in front of you. Pull the towel towards your chest, squeezing your shoulder blades together. Pause for a moment at the top, then slowly lower the towel back to the starting position. Repeat for the desired number of repetitions, then switch arms.')
ON CONFLICT (id) DO NOTHING;

-- ── Legs ──────────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1410', 'Barbell Lateral Lunge', 'Legs', 'upper legs', 'barbell', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'glutes', 'Stand with your feet shoulder-width apart, holding a barbell across your upper back. Take a big step to the side with your right foot, keeping your left foot planted. Bend your right knee and lower your body down into a lunge position, keeping your left leg straight. Push off with your right foot and return to the starting position. Repeat on the other side, stepping with your left foot.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1466', 'Twist Hip Lift', 'Legs', 'upper legs', 'body weight', 'obliques', ARRAY['obliques', 'hamstrings'], 'glutes', 'Lie on your back with your knees bent and feet flat on the ground. Place your hands by your sides for support. Engage your glutes and lift your hips off the ground, forming a straight line from your knees to your shoulders. While keeping your hips lifted, twist your lower body to the right side, bringing your knees towards the ground. Return to the starting position and repeat the twist to the left side. Continue alternating twists for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0613', 'Lying Side Quad Stretch', 'Legs', 'upper legs', 'body weight', 'hamstrings', ARRAY['hamstrings'], 'quads', 'Lie on your side with your legs straight. Bend your top leg and grab your ankle or foot with your hand. Gently pull your ankle or foot towards your glutes until you feel a stretch in your quads. Hold the stretch for 20–30 seconds. Release the stretch and repeat on the other side.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0032', 'Barbell Deadlift', 'Legs', 'upper legs', 'barbell', 'hamstrings', ARRAY['hamstrings', 'lower back'], 'glutes', 'Stand with your feet shoulder-width apart and the barbell on the ground in front of you. Bend your knees and hinge at the hips to lower your torso and grip the barbell with an overhand grip, hands slightly wider than shoulder-width apart. Keep your back straight and chest lifted as you drive through your heels to lift the barbell off the ground, extending your hips and knees. As you stand up straight, squeeze your glutes and keep your core engaged. Lower the barbell back down to the ground by bending at the hips and knees, keeping your back straight. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0029', 'Barbell Front Squat', 'Legs', 'upper legs', 'barbell', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'glutes', 'Start by standing with your feet shoulder-width apart and the barbell resting on your upper chest, with your elbows pointing forward. Lower your body by bending your knees and pushing your hips back, as if you are sitting back into a chair. Keep your chest up and your back straight as you lower down, making sure your knees do not go past your toes. Continue lowering until your thighs are parallel to the ground. Pause for a moment at the bottom, then push through your heels to stand back up. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1435', 'Barbell Low Bar Squat', 'Legs', 'upper legs', 'barbell', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'glutes', 'Stand with your feet shoulder-width apart and the barbell resting on your upper back. Keeping your chest up and core engaged, slowly lower your body by bending your knees and pushing your hips back. Continue lowering until your thighs are parallel to the ground or slightly below. Pause for a moment, then push through your heels to return to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3769', 'Curtsey Squat', 'Legs', 'upper legs', 'body weight', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'glutes', 'Stand with your feet shoulder-width apart. Take a step diagonally behind and across your body with your right foot, crossing it behind your left leg. Bend both knees as if you were curtsying, lowering your body towards the ground. Keep your torso upright and your weight on your front foot. Push through your front foot to return to the starting position. Repeat on the other side.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0300', 'Dumbbell Deadlift', 'Legs', 'upper legs', 'dumbbell', 'hamstrings', ARRAY['hamstrings', 'lower back'], 'glutes', 'Stand with your feet shoulder-width apart, toes pointing forward. Hold a dumbbell in each hand, palms facing your body, arms extended downwards. Bend at your hips and knees, lowering the dumbbells towards the ground while keeping your back straight. Push through your heels and extend your hips and knees, lifting the dumbbells back up to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1587', 'Seated Wide Angle Stretch', 'Legs', 'upper legs', 'body weight', 'quadriceps', ARRAY['quadriceps', 'calves'], 'hamstrings', 'Sit on the ground with your legs extended in a wide angle. Flex your feet and engage your quadriceps. Place your hands on the ground behind you for support. Keeping your back straight, lean forward from your hips until you feel a stretch in your hamstrings. Hold this position for a few breaths, then slowly release and return to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0028', 'Barbell Clean and Press', 'Legs', 'upper legs', 'barbell', 'hamstrings', ARRAY['hamstrings', 'glutes', 'shoulders'], 'quads', 'Stand with your feet shoulder-width apart and the barbell on the floor in front of you. Grip the barbell with an overhand grip, hands slightly wider than shoulder-width. Drive through your heels to lift the barbell, keeping it close to your body. Explosively extend your hips and shrug your shoulders to pull the bar up. Catch the bar at shoulder level with elbows forward. Press the barbell overhead by extending your arms. Lower back to the starting position and repeat.')
ON CONFLICT (id) DO NOTHING;

-- ── Push ──────────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3785', 'Incline Push-Up (on box)', 'Push', 'chest', 'body weight', 'triceps', ARRAY['triceps', 'shoulders'], 'pectorals', 'Place your hands on the edge of a box or elevated surface, slightly wider than shoulder-width apart. Extend your legs behind you, resting on the balls of your feet, creating a straight line from your head to your heels. Lower your chest towards the box by bending your elbows, keeping your body in a straight line. Pause for a moment at the bottom, then push yourself back up to the starting position by straightening your arms. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0301', 'Dumbbell Decline Bench Press', 'Push', 'chest', 'dumbbell', 'triceps', ARRAY['triceps', 'shoulders'], 'pectorals', 'Lie down on a decline bench with your feet secured and your head lower than your hips. Hold a dumbbell in each hand and extend your arms straight up above your chest, palms facing forward. Lower the dumbbells slowly to the sides of your chest, keeping your elbows at a 90-degree angle. Push the dumbbells back up to the starting position, fully extending your arms. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3021', 'Scapula Push-Up', 'Push', 'chest', 'body weight', 'triceps', ARRAY['triceps', 'shoulders'], 'serratus anterior', 'Start in a high plank position with your hands directly under your shoulders and your body in a straight line. Without bending your elbows, let your chest sink towards the ground by allowing your shoulder blades to come together. Then push the ground away, spreading your shoulder blades wide. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1306', 'Plyo Push-Up', 'Push', 'chest', 'body weight', 'triceps', ARRAY['triceps', 'shoulders', 'core'], 'pectorals', 'Start in a high plank position with your hands slightly wider than shoulder-width apart. Lower your chest towards the ground by bending your elbows, keeping your body in a straight line. Push explosively off the ground, using your chest muscles to propel your upper body off the ground. Land softly with your hands back in the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0666', 'Raise Single Arm Push-Up', 'Push', 'chest', 'body weight', 'triceps', ARRAY['triceps', 'shoulders', 'core'], 'pectorals', 'Start in a push-up position with your hands slightly wider than shoulder-width apart and your feet together. Extend one arm straight out to the side, parallel to the ground. Lower your body towards the ground by bending your elbows, keeping your back straight and core engaged. Push back up to the starting position, using your chest muscles to lift your body. Repeat with the other arm extended.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1276', 'Dumbbell Decline One Arm Fly', 'Push', 'chest', 'dumbbell', 'shoulders', ARRAY['shoulders'], 'pectorals', 'Lie down on a decline bench with a dumbbell in one hand, resting it on your thigh. Using your thigh to help raise the dumbbell, lift it up to shoulder width with your palm facing your torso. Rotate your wrist so that the palm of your hand is facing forward. As you breathe in, lower the dumbbell slowly to the side until you feel a stretch in your chest. Exhale and use your chest muscles to bring the dumbbell back up to the starting position. Repeat for the desired number of repetitions, then switch arms.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1288', 'Dumbbell One Arm Fly on Ball', 'Push', 'chest', 'dumbbell', 'shoulders', ARRAY['shoulders', 'triceps'], 'pectorals', 'Sit on an exercise ball with a dumbbell in one hand and your feet flat on the ground. Walk your feet forward and roll your body down until your upper back is resting on the exercise ball. Extend your arm with the dumbbell straight up above your chest, palm facing inwards. Slowly lower the dumbbell out to the side, keeping a slight bend in your elbow. Pause for a moment, then squeeze your chest muscles to bring the dumbbell back to the starting position. Repeat for the desired number of repetitions, then switch arms.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0492', 'Incline Push-Up Depth Jump', 'Push', 'chest', 'body weight', 'triceps', ARRAY['triceps', 'shoulders', 'core'], 'pectorals', 'Find an elevated surface, such as a bench or step, and place your hands shoulder-width apart on the edge. Step your feet back, keeping your body in a straight line from head to heels. Lower your chest towards the edge of the surface, bending your elbows and keeping your body aligned. Push through your palms to extend your arms and return to the starting position. Jump off the edge of the surface, landing softly with your knees slightly bent. Repeat the push-up and depth jump for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

-- ── Core ──────────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0508', 'Janda Sit-Up', 'Core', 'waist', 'body weight', 'hip flexors', ARRAY['hip flexors', 'lower back'], 'abs', 'Lie flat on your back with your knees bent and feet flat on the ground. Place your hands behind your head with your elbows pointing outwards. Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle. Pause for a moment at the top, then slowly lower your upper body back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0635', 'Oblique Crunches', 'Core', 'waist', 'body weight', 'obliques', ARRAY['obliques'], 'abs', 'Lie on your back with your knees bent and feet flat on the floor. Place your hands behind your head or cross them over your chest. Engage your abs and lift your shoulder blades off the floor, rotating your torso to one side. Pause for a moment, then lower your shoulder blades back down to the floor. Repeat on the other side, alternating sides with each repetition.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('2429', 'Frog Crunch', 'Core', 'waist', 'body weight', 'hip flexors', ARRAY['hip flexors'], 'abs', 'Lie flat on your back with your knees bent and feet flat on the ground. Place your hands behind your head with your elbows pointing outwards. Engaging your abs, lift your upper body off the ground, curling forward until your torso is at a 45-degree angle. Pause for a moment at the top, then slowly lower your upper body back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3420', 'V-Sit', 'Core', 'waist', 'body weight', 'hip flexors', ARRAY['hip flexors'], 'abs', 'Sit on the floor with your legs extended in front of you. Lean back slightly and lift your legs off the ground, keeping them straight. Simultaneously, lift your upper body off the ground and reach your arms towards your legs. Hold this position for a few seconds, then slowly lower your upper body and legs back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0001', '3/4 Sit-Up', 'Core', 'waist', 'body weight', 'hip flexors', ARRAY['hip flexors', 'lower back'], 'abs', 'Lie flat on your back with your knees bent and feet flat on the ground. Place your hands behind your head with your elbows pointing outwards. Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle. Pause for a moment at the top, then slowly lower your upper body back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3298', 'Straddle Planche', 'Core', 'waist', 'body weight', 'shoulders', ARRAY['shoulders', 'triceps', 'chest'], 'abs', 'Start in a push-up position with your hands shoulder-width apart and your feet spread wide apart. Engage your core and slowly shift your weight forward, bringing your shoulders over your hands. Bend your elbows and lower your body towards the ground, keeping your elbows close to your sides. Pause for a moment at the bottom, then push through your hands to straighten your arms and lift your body back up to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('2963', 'Captain''s Chair Straight Leg Raise', 'Core', 'waist', 'body weight', 'hip flexors', ARRAY['hip flexors'], 'abs', 'Sit on the captain''s chair with your back against the backrest and your forearms resting on the arm pads. Keep your upper body stable and your back straight. Engage your abs and lift your legs up in front of you, keeping them straight. Continue lifting until your legs are parallel to the ground or as high as you can comfortably go. Pause for a moment at the top, then slowly lower your legs back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0705', 'Side Bridge', 'Core', 'waist', 'body weight', 'obliques', ARRAY['obliques', 'glutes'], 'abs', 'Lie on your side with your legs extended and stacked on top of each other. Place your forearm on the ground directly below your shoulder, with your elbow bent at a 90-degree angle. Engage your core and lift your hips off the ground, creating a straight line from your head to your feet. Hold this position for the desired amount of time. Lower your hips back down to the starting position. Repeat on the other side.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0649', 'Plank', 'Core', 'waist', 'body weight', 'transverse abdominis', ARRAY['shoulders', 'glutes'], 'abs', 'Start in a push-up position. Lower yourself onto your forearms so that your elbows are directly below your shoulders. Keep your body in a straight line from your head to your heels. Engage your core and hold this position. Do not let your hips sag or rise. Hold for the desired duration, then lower your knees to the floor to rest.')
ON CONFLICT (id) DO NOTHING;

-- ── Shoulders ─────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0387', 'Dumbbell Seated Alternate Front Raise', 'Shoulders', 'shoulders', 'dumbbell', 'trapezius', ARRAY['trapezius', 'biceps'], 'delts', 'Sit on a bench with your back straight and feet flat on the ground. Hold a dumbbell in each hand with your palms facing your body and arms extended down by your sides. Keeping your arms straight, raise one dumbbell in front of you until it is parallel to the ground. Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position. Repeat with the other arm. Alternate between arms for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0363', 'Dumbbell One Arm Upright Row', 'Shoulders', 'shoulders', 'dumbbell', 'traps', ARRAY['traps', 'biceps'], 'delts', 'Stand with your feet shoulder-width apart, holding a dumbbell in one hand with an overhand grip. Let the dumbbell hang at arm''s length in front of your thighs, with your palm facing your body. Keeping your back straight and your core engaged, lift the dumbbell straight up towards your chin, leading with your elbow. Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position. Repeat for the desired number of repetitions, then switch to the other arm.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0341', 'Dumbbell Rear Deltoid Raise', 'Shoulders', 'shoulders', 'dumbbell', 'trapezius', ARRAY['trapezius', 'rhomboids'], 'delts', 'Lie face down on a flat bench with a dumbbell in one hand, palm facing inwards. Extend your arm straight down towards the floor, keeping it close to your body. Raise your arm up and back, squeezing your shoulder blade towards your spine. Pause for a moment at the top, then slowly lower your arm back down to the starting position. Repeat for the desired number of repetitions, then switch arms.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0287', 'Dumbbell Arnold Press', 'Shoulders', 'shoulders', 'dumbbell', 'triceps', ARRAY['triceps', 'upper chest'], 'delts', 'Sit on a bench with back support and hold a dumbbell in each hand at shoulder level, palms facing your body and elbows bent. Press the dumbbells upward until your arms are fully extended and your palms are facing forward. Rotate your wrists as you lift, so that your palms end up facing forward at the top of the movement. Pause for a moment at the top, then slowly lower the dumbbells back to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0325', 'Dumbbell Incline Shoulder Raise', 'Shoulders', 'shoulders', 'dumbbell', 'trapezius', ARRAY['trapezius', 'triceps'], 'delts', 'Sit on an incline bench with a dumbbell in each hand, resting on your thighs. Lean back on the bench and raise the dumbbells to shoulder height, palms facing forward. Keeping your back against the bench, raise the dumbbells above your head, fully extending your arms. Pause for a moment at the top, then slowly lower the dumbbells back to shoulder height. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0120', 'Barbell Upright Row', 'Shoulders', 'shoulders', 'barbell', 'traps', ARRAY['traps', 'biceps'], 'delts', 'Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart. Let the barbell hang in front of your thighs, arms fully extended. Keeping your back straight and core engaged, lift the barbell straight up towards your chin, leading with your elbows. Pause for a moment at the top, then slowly lower the barbell back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0788', 'Standing Behind Neck Press', 'Shoulders', 'shoulders', 'barbell', 'triceps', ARRAY['triceps', 'upper back'], 'delts', 'Stand with your feet shoulder-width apart and hold the barbell behind your neck with an overhand grip. Keep your back straight and core engaged. Press the barbell overhead by extending your arms, fully extending your elbows. Pause for a moment at the top, then slowly lower the barbell back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

-- ── Arms ──────────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0081', 'Barbell Reverse Preacher Curl', 'Arms', 'upper arms', 'barbell', 'forearms', ARRAY['forearms'], 'biceps', 'Sit on a preacher bench with your chest against the pad and your arms extended straight down, holding a barbell with an overhand grip. Keeping your upper arms stationary, curl the barbell upward while contracting your biceps. Continue to raise the barbell until your biceps are fully contracted and the barbell is at shoulder level. Hold the contracted position for a brief pause as you squeeze your biceps. Slowly lower the barbell back to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0353', 'Dumbbell Concentration Curl (Ball)', 'Arms', 'upper arms', 'dumbbell', 'forearms', ARRAY['forearms'], 'biceps', 'Sit on a stability ball with your feet flat on the ground and your knees bent at a 90-degree angle. Hold a dumbbell in one hand with your palm facing up and your arm extended down towards the floor. Rest your elbow on the inside of your thigh, just above the knee. Keeping your upper arm stationary, curl the dumbbell up towards your shoulder while contracting your biceps. Pause for a moment at the top of the movement, then slowly lower the dumbbell back down to the starting position. Repeat for the desired number of repetitions, then switch arms.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1718', 'Close-Grip Behind Neck Triceps Extension', 'Arms', 'upper arms', 'barbell', 'shoulders', ARRAY['shoulders'], 'triceps', 'Sit on a bench with your back straight and feet flat on the ground. Hold the barbell with a close grip behind your neck, palms facing forward. Keep your elbows close to your head and slowly lower the barbell towards the back of your head. Pause for a moment, then extend your arms back up to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1735', 'Dumbbell Lying Single Extension', 'Arms', 'upper arms', 'dumbbell', 'shoulders', ARRAY['shoulders'], 'triceps', 'Lie flat on a bench with a dumbbell in one hand and your arm fully extended above your chest. Lower the dumbbell in a controlled manner towards your forehead, keeping your upper arm stationary. Pause briefly at the bottom of the movement, then extend your arm back to the starting position. Repeat for the desired number of repetitions, then switch arms.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0338', 'Dumbbell Lying Elbow Press', 'Arms', 'upper arms', 'dumbbell', 'chest', ARRAY['chest', 'shoulders'], 'triceps', 'Lie flat on a bench with a dumbbell in each hand, palms facing each other and arms extended straight up over your chest. Lower the dumbbells towards your shoulders by bending your elbows, keeping your upper arms stationary. Pause for a moment at the bottom, then press the dumbbells back up to the starting position by extending your elbows. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0425', 'Dumbbell Reverse Curl', 'Arms', 'upper arms', 'dumbbell', 'forearms', ARRAY['forearms'], 'biceps', 'Stand up straight with your feet shoulder-width apart and hold a dumbbell in one hand with an overhand grip. Keep your arm fully extended and close to your body, with your palm facing down. Slowly curl the dumbbell up towards your shoulder, keeping your upper arm stationary. Pause for a moment at the top, then slowly lower the dumbbell back down to the starting position. Repeat for the desired number of repetitions, then switch to the other arm.')
ON CONFLICT (id) DO NOTHING;

-- ── Cardio ────────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3224', 'Jumping Jacks', 'Cardio', 'cardio', 'body weight', 'quadriceps', ARRAY['quadriceps', 'calves'], 'cardiovascular system', 'Stand with your feet together and your arms by your sides. Jump up, spreading your feet apart and raising your arms above your head. As you land, quickly jump back to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3672', 'Back and Forth Step', 'Cardio', 'cardio', 'body weight', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'glutes'], 'cardiovascular system', 'Stand with your feet shoulder-width apart. Step forward with your right foot, bending your knee and lowering your body into a lunge position. Push off with your right foot and step back to the starting position. Repeat the movement with your left foot, alternating legs with each step. Continue stepping back and forth, maintaining a steady pace. Repeat for the desired duration or number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3222', 'Semi Squat Jump', 'Cardio', 'cardio', 'body weight', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'cardiovascular system', 'Stand with your feet shoulder-width apart. Bend your knees and lower your body into a squat position. Jump explosively, extending your hips and knees while swinging your arms for momentum. Land softly on the balls of your feet and immediately go into the next repetition. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('3671', 'Skater Jump', 'Cardio', 'cardio', 'body weight', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'glutes'], 'cardiovascular system', 'Stand with your feet shoulder-width apart. Bend your knees slightly and keep your back straight. Jump to the right, landing on your right foot while swinging your left leg behind your right leg. Immediately jump to the left, landing on your left foot while swinging your right leg behind your left leg. Continue alternating jumps from side to side, mimicking a skiing motion. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1160', 'Burpee', 'Cardio', 'cardio', 'body weight', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'cardiovascular system', 'Start in a standing position with your feet shoulder-width apart. Lower your body into a squat position by bending your knees and placing your hands on the floor in front of you. Kick your feet back into a push-up position. Perform a push-up, keeping your body in a straight line. Jump your feet back into the squat position. Jump up explosively, reaching your arms overhead. Land softly and immediately lower back into a squat position to begin the next repetition.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0684', 'Running in Place', 'Cardio', 'cardio', 'body weight', 'quadriceps', ARRAY['quadriceps', 'hamstrings', 'calves'], 'cardiovascular system', 'Start by standing upright with your feet hip-width apart. Engage your core and keep your upper body relaxed. Begin jogging in place, lifting your knees up towards your chest and landing softly on the balls of your feet. Maintain a steady pace and continue jogging for the desired duration or distance. Remember to breathe deeply and maintain good posture throughout the exercise.')
ON CONFLICT (id) DO NOTHING;

-- ── Calves ────────────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0088', 'Barbell Seated Calf Raise', 'Calves', 'lower legs', 'barbell', 'hamstrings', ARRAY['hamstrings', 'quadriceps'], 'calves', 'Sit on a bench with your feet flat on the floor and a barbell resting on your thighs. Place the balls of your feet on a raised platform, such as a block or step. Position the barbell across your thighs and hold it securely with your hands. Keeping your back straight and your core engaged, lift your heels off the ground by extending your ankles. Pause for a moment at the top, then slowly lower your heels back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('0409', 'Dumbbell Single Leg Calf Raise', 'Calves', 'lower legs', 'dumbbell', 'ankles', ARRAY['ankles'], 'calves', 'Stand on the edge of a step or platform with your heels hanging off and your toes on the step. Hold a dumbbell in one hand and place your other hand on a wall or railing for support. Raise your heel as high as possible, lifting your body up onto your toes. Pause for a moment at the top, then slowly lower your heel back down below the step. Repeat for the desired number of repetitions, then switch to the other leg.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1407', 'Calf Wall Stretch', 'Calves', 'lower legs', 'body weight', 'hamstrings', ARRAY['hamstrings'], 'calves', 'Stand facing a wall with your feet hip-width apart. Place your hands against the wall at shoulder height. Step back with one foot, keeping your heel on the ground and your leg straight. Bend your front knee slightly and lean forward, feeling a stretch in your calf. Hold the stretch for 20–30 seconds. Switch legs and repeat the stretch.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exercises (id, name, category, body_part, equipment, muscle_group, secondary_muscles, target, instructions) VALUES
('1490', 'Standing Calf Raise (Staircase)', 'Calves', 'lower legs', 'body weight', 'ankles', ARRAY['ankles', 'feet'], 'calves', 'Stand on the edge of a step or a sturdy platform with your heels hanging off and your toes on the step. Hold onto a railing or wall for balance if needed. Slowly raise your heels as high as possible, lifting your body weight onto the balls of your feet. Pause for a moment at the top, then slowly lower your heels back down to the starting position. Repeat for the desired number of repetitions.')
ON CONFLICT (id) DO NOTHING;
