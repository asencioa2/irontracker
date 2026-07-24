// IronTracker — Database Helpers (db.js)
// Shared Supabase query functions used across the app.
// All functions return { data, error } or resolved values.
// ============================================================

// ── Auth guard ───────────────────────────────────────────────
// Call at the top of any function that needs a logged-in user.
function requireUser() {
  if (!currentUser) throw new Error('Not authenticated');
  return currentUser;
}

// ── Generic error handler ────────────────────────────────────
// Logs to console and shows a toast. Returns true if there was an error.
function dbError(error, context = '') {
  if (!error) return false;
  const msg = context ? `${context}: ${error.message}` : error.message;
  console.error('[DB Error]', context, error);
  toast(msg);
  return true;
}

// ── Profile ──────────────────────────────────────────────────
async function dbGetProfile(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  return { data, error };
}

async function dbSaveProfile(updates) {
  const user = requireUser();
  const { error } = await sb.from('profiles').upsert({ id: user.id, ...updates });
  if (error) dbError(error, 'Save profile');
  return !error;
}

// ── Friends ──────────────────────────────────────────────────
// Cached for the session — call dbClearFriendCache() on friend add/remove
let _friendCache = null;
let _friendCacheTime = 0;
const FRIEND_CACHE_MS = 30000; // 30 seconds

async function dbGetFriendIds() {
  const user = requireUser();
  const now = Date.now();
  if (_friendCache && now - _friendCacheTime < FRIEND_CACHE_MS) {
    return _friendCache;
  }
  const { data, error } = await sb.from('friendships')
    .select('requester_id,addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');
  if (error) { dbError(error, 'Load friends'); return []; }
  const ids = (data || []).map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id);
  _friendCache = ids;
  _friendCacheTime = now;
  return ids;
}

async function dbGetFriendships() {
  const user = requireUser();
  const { data, error } = await sb.from('friendships')
    .select('*')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');
  if (error) { dbError(error, 'Load friendships'); return []; }
  return data || [];
}

function dbClearFriendCache() {
  _friendCache = null;
  _friendCacheTime = 0;
}

// ── Workout logs ─────────────────────────────────────────────
async function dbGetWorkoutLogs(userId, { startDate, limit } = {}) {
  let query = sb.from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (startDate) query = query.gte('date', startDate);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { dbError(error, 'Load workout logs'); return []; }
  return data || [];
}

async function dbSaveWorkoutLog(log) {
  const user = requireUser();
  const { data, error } = await sb.from('workout_logs')
    .insert({ user_id: user.id, ...log })
    .select()
    .single();
  if (error) { dbError(error, 'Save workout'); return null; }
  return data;
}

// ── Nutrition ─────────────────────────────────────────────────
async function dbGetNutritionLogs(userId, date) {
  const { data, error } = await sb.from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });
  if (error) { dbError(error, 'Load nutrition'); return []; }
  return data || [];
}

async function dbDeleteNutritionLog(id) {
  const user = requireUser();
  const { error } = await sb.from('nutrition_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) dbError(error, 'Delete food entry');
  return !error;
}

// ── Personal records ──────────────────────────────────────────
async function dbGetPRs(userId) {
  const { data, error } = await sb.from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('exercise');
  if (error) { dbError(error, 'Load PRs'); return []; }
  return data || [];
}

async function dbUpsertPR(exercise, weightLbs, reps, date, estimated1rm) {
  const user = requireUser();
  const { error } = await sb.from('personal_records').upsert({
    user_id: user.id,
    exercise,
    weight_lbs: weightLbs,
    reps,
    date,
    estimated_orm: estimated1rm,
  }, { onConflict: 'user_id,exercise' });
  if (error) dbError(error, 'Save PR');
  return !error;
}

async function dbDeletePR(exercise) {
  const user = requireUser();
  const { error } = await sb.from('personal_records')
    .delete()
    .eq('user_id', user.id)
    .eq('exercise', exercise);
  if (error) dbError(error, 'Delete PR');
  return !error;
}

// ── Weight logs ───────────────────────────────────────────────
async function dbGetWeightLogs(userId) {
  const { data, error } = await sb.from('weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });
  if (error) { dbError(error, 'Load weight logs'); return []; }
  return data || [];
}

async function dbSaveWeight(weightLbs, date) {
  const user = requireUser();
  const { error } = await sb.from('weight_logs')
    .insert({ user_id: user.id, weight_lbs: weightLbs, date });
  if (error) { dbError(error, 'Save weight'); return false; }
  return true;
}

// ── Cardio logs ───────────────────────────────────────────────
async function dbGetCardioLogs(userId, date) {
  const { data, error } = await sb.from('cardio_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });
  if (error) { dbError(error, 'Load cardio'); return []; }
  return data || [];
}

async function dbSaveCardio(entry) {
  const user = requireUser();
  const { error } = await sb.from('cardio_logs')
    .insert({ user_id: user.id, ...entry });
  if (error) { dbError(error, 'Save cardio'); return false; }
  return true;
}

async function dbDeleteCardio(id) {
  const user = requireUser();
  const { error } = await sb.from('cardio_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);
  if (error) dbError(error, 'Delete cardio');
  return !error;
}

// ── Social ────────────────────────────────────────────────────
async function dbGetFeedPosts(friendIds) {
  const allIds = [...friendIds, requireUser().id];
  const { data, error } = await sb.from('workout_posts')
    .select('*')
    .in('user_id', allIds)
    .order('posted_at', { ascending: false })
    .limit(30);
  if (error) { dbError(error, 'Load feed'); return []; }
  return data || [];
}

async function dbGetPostComments(postId) {
  const { data, error } = await sb.from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) { dbError(error, 'Load comments'); return []; }
  return data || [];
}

async function dbAddComment(postId, body, displayName, username) {
  const user = requireUser();
  const { error } = await sb.from('post_comments').insert({
    post_id: postId,
    user_id: user.id,
    body,
    display_name: displayName,
    username,
    created_at: new Date().toISOString(),
  });
  if (error) { dbError(error, 'Add comment'); return false; }
  return true;
}

async function dbToggleLike(postId) {
  const user = requireUser();
  const { data: existing } = await sb.from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();
  if (existing) {
    const { error } = await sb.from('post_likes').delete().eq('id', existing.id);
    if (error) dbError(error, 'Unlike');
    return { liked: false, error };
  } else {
    const { error } = await sb.from('post_likes')
      .insert({ post_id: postId, user_id: user.id });
    if (error) dbError(error, 'Like');
    return { liked: true, error };
  }
}

// ── Measurements ──────────────────────────────────────────────
async function dbGetMeasurements(userId) {
  const { data, error } = await sb.from('measurements')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1);
  if (error) { dbError(error, 'Load measurements'); return null; }
  return data?.[0] || null;
}

async function dbSaveMeasurements(measurements) {
  const user = requireUser();
  const { error } = await sb.from('measurements')
    .insert({ user_id: user.id, date: today(), ...measurements });
  if (error) { dbError(error, 'Save measurements'); return false; }
  return true;
}

// ── Push subscriptions ────────────────────────────────────────
async function dbSavePushSubscription(subscription) {
  const user = requireUser();
  const { error } = await sb.from('push_subscriptions').upsert({
    user_id: user.id,
    subscription: JSON.stringify(subscription),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) { dbError(error, 'Save push subscription'); return false; }
  return true;
}

// ── Notifications ─────────────────────────────────────────────
async function dbGetUnreadNotifCount(userId) {
  const { data, error } = await sb.from('workout_notifications')
    .select('id')
    .eq('to_user_id', userId)
    .eq('read', false);
  if (error) return 0;
  return data?.length || 0;
}

async function dbMarkNotificationsRead(userId) {
  const { error } = await sb.from('workout_notifications')
    .update({ read: true })
    .eq('to_user_id', userId)
    .eq('read', false);
  if (error) dbError(error, 'Mark notifications read');
  return !error;
}

// ── Rest days ─────────────────────────────────────────────────
async function dbLogRestDay(date) {
  const user = requireUser();
  const { error } = await sb.from('rest_days')
    .upsert({ user_id: user.id, date }, { onConflict: 'user_id,date', ignoreDuplicates: true });
  if (error) dbError(error, 'Log rest day');
  return !error;
}

// ── Username ──────────────────────────────────────────────────
async function dbGetUsername(userId) {
  const { data, error } = await sb.from('usernames')
    .select('username,display_name')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
}

async function dbSetUsername(username, displayName) {
  const user = requireUser();
  const { error } = await sb.from('usernames')
    .insert({ user_id: user.id, username, display_name: displayName });
  if (error) { dbError(error, 'Set username'); return false; }
  return true;
}

// ── Live workout status ───────────────────────────────────────
async function dbSetLiveStatus(isLive, dayName, setsData) {
  const user = requireUser();
  const { error } = await sb.from('workout_live').upsert({
    user_id: user.id,
    is_live: isLive,
    day_name: dayName,
    sets_data: setsData || {},
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) dbError(error, 'Set live status');
  return !error;
}

// ── Leaderboard ───────────────────────────────────────────────
async function dbGetLeaderboardData(allIds, startDate) {
  const addDate = q => startDate ? q.gte('date', startDate) : q;
  const [logsRes, prsRes, cardioRes, profilesRes, unRes] = await Promise.all([
    addDate(sb.from('workout_logs').select('user_id,volume,date,sets_data').in('user_id', allIds)),
    addDate(sb.from('personal_records').select('user_id,exercise').in('user_id', allIds)),
    addDate(sb.from('cardio_logs').select('user_id,duration_min').in('user_id', allIds)),
    sb.from('profiles').select('id,name').in('id', allIds),
    sb.from('usernames').select('user_id,display_name,username').in('user_id', allIds),
  ]);
  return {
    logs: logsRes.data || [],
    prs: prsRes.data || [],
    cardio: cardioRes.data || [],
    profiles: profilesRes.data || [],
    usernames: unRes.data || [],
  };
}

// ── Name resolution ───────────────────────────────────────────
// Build a name map from profiles + usernames data — skips 'Athlete' fallback
function buildNameMap(profiles, usernames, currentUserId, currentUserProfile) {
  const map = {};
  (profiles || []).forEach(p => { if (p.name && p.name !== 'Athlete') map[p.id] = p.name; });
  (usernames || []).forEach(u => {
    if (u.display_name && u.display_name !== 'Athlete') map[u.user_id] = u.display_name;
    else if (u.username && !map[u.user_id]) map[u.user_id] = '@' + u.username;
  });
  if (!map[currentUserId]) {
    map[currentUserId] = currentUserProfile?.name
      || currentUserProfile?.display_name
      || currentUser?.email?.split('@')[0]
      || 'You';
  }
  return map;
}

// ── Custom exercises ──────────────────────────────────────────
async function dbGetCustomExercises(userId, dow) {
  const { data, error } = await sb.from('custom_exercises')
    .select('*').eq('user_id', userId).eq('dow', dow).order('created_at');
  if (error) { dbError(error, 'Load custom exercises'); return []; }
  return data || [];
}

async function dbAddCustomExercise(dow, name, target) {
  const user = requireUser();
  const { error } = await sb.from('custom_exercises')
    .insert({ user_id: user.id, dow, name, target });
  if (error) { dbError(error, 'Add exercise'); return false; }
  return true;
}

async function dbDeleteCustomExercise(id) {
  const user = requireUser();
  const { error } = await sb.from('custom_exercises')
    .delete().eq('id', id).eq('user_id', user.id);
  if (error) { dbError(error, 'Delete exercise'); return false; }
  return true;
}

async function dbGetHiddenExercises(userId, splitKey, dow) {
  const { data, error } = await sb.from('hidden_exercises')
    .select('exercise_name').eq('user_id', userId).eq('split_key', splitKey).eq('dow', dow);
  if (error) { dbError(error, 'Load hidden exercises'); return []; }
  return data || [];
}

async function dbHideExercise(splitKey, dow, exerciseName) {
  const user = requireUser();
  const { error } = await sb.from('hidden_exercises')
    .insert({ user_id: user.id, split_key: splitKey, dow, exercise_name: exerciseName });
  if (error) { dbError(error, 'Hide exercise'); return false; }
  return true;
}

async function dbUnhideExercise(splitKey, dow, exerciseName) {
  const user = requireUser();
  const { error } = await sb.from('hidden_exercises')
    .delete().eq('user_id', user.id).eq('split_key', splitKey)
    .eq('dow', dow).eq('exercise_name', exerciseName);
  if (error) { dbError(error, 'Unhide exercise'); return false; }
  return true;
}

// ── Workout logs ──────────────────────────────────────────────
async function dbGetNextSplitIndex(userId, splitLength) {
  const { data, error } = await sb.from('workout_logs')
    .select('split_index,date').eq('user_id', userId)
    .order('date', { ascending: false }).limit(1);
  if (error) { dbError(error, 'Get split index'); return 0; }
  if (!data?.length) return 0;
  return ((data[0].split_index ?? -1) + 1) % splitLength;
}

async function dbGetRecentWorkoutSets(userId, limit = 10) {
  const { data, error } = await sb.from('workout_logs')
    .select('date,sets_data').eq('user_id', userId)
    .order('date', { ascending: false }).limit(limit);
  if (error) { dbError(error, 'Load recent workouts'); return []; }
  return data || [];
}

async function dbInsertWorkoutLog(log) {
  const user = requireUser();
  const { data, error } = await sb.from('workout_logs')
    .insert({ user_id: user.id, ...log }).select().single();
  if (error) { dbError(error, 'Save workout'); return null; }
  return data;
}

async function dbGetWorkoutLogsForStreak(userIds) {
  const { data, error } = await sb.from('workout_logs')
    .select('user_id,date').in('user_id', userIds);
  if (error) { dbError(error, 'Load streak data'); return []; }
  return data || [];
}

// ── Nutrition ─────────────────────────────────────────────────
async function dbGetNutritionTotals(userId, date) {
  const { data, error } = await sb.from('nutrition_logs')
    .select('cal,protein,carbs,fat').eq('user_id', userId).eq('date', date);
  if (error) { dbError(error, 'Load nutrition totals'); return []; }
  return data || [];
}

async function dbInsertNutritionLog(log) {
  const user = requireUser();
  const { error } = await sb.from('nutrition_logs')
    .insert({ user_id: user.id, ...log });
  if (error) { dbError(error, 'Save food entry'); return false; }
  return true;
}

async function dbDeleteNutritionEntry(id) {
  const user = requireUser();
  const { error } = await sb.from('nutrition_logs')
    .delete().eq('id', id).eq('user_id', user.id);
  if (error) { dbError(error, 'Delete food entry'); return false; }
  return true;
}

// ── Weight & measurements ─────────────────────────────────────
async function dbUpsertWeight(date, weightLbs, notes) {
  const user = requireUser();
  const { error } = await sb.from('weight_logs')
    .upsert({ user_id: user.id, date, weight_lbs: weightLbs, notes },
      { onConflict: 'user_id,date' });
  if (error) { dbError(error, 'Save weight'); return false; }
  return true;
}

async function dbInsertMeasurements(entry) {
  const user = requireUser();
  const { error } = await sb.from('measurements')
    .insert({ user_id: user.id, date: new Date().toISOString().split('T')[0], ...entry });
  if (error) { dbError(error, 'Save measurements'); return false; }
  return true;
}

// ── Social ────────────────────────────────────────────────────
async function dbInsertWorkoutPost(post) {
  const user = requireUser();
  const { error } = await sb.from('workout_posts')
    .insert({ user_id: user.id, ...post });
  if (error) { dbError(error, 'Publish workout'); return false; }
  return true;
}

async function dbGetWorkoutPost(postId) {
  const { data, error } = await sb.from('workout_posts')
    .select('*').eq('id', postId).single();
  if (error) { dbError(error, 'Load post'); return null; }
  return data;
}

async function dbDeletePost(postId) {
  const user = requireUser();
  const { error } = await sb.from('workout_posts')
    .delete().eq('id', postId).eq('user_id', user.id);
  if (error) { dbError(error, 'Delete post'); return false; }
  return true;
}

async function dbInsertComment(postId, body, displayName, username) {
  const user = requireUser();
  const { error } = await sb.from('post_comments').insert({
    post_id: postId, user_id: user.id, body,
    display_name: displayName, username,
    created_at: new Date().toISOString(),
  });
  if (error) { dbError(error, 'Add comment'); return false; }
  return true;
}

async function dbDeleteComment(id) {
  const user = requireUser();
  const { error } = await sb.from('post_comments')
    .delete().eq('id', id).eq('user_id', user.id);
  if (error) { dbError(error, 'Delete comment'); return false; }
  return true;
}

async function dbGetLikes(postIds) {
  const { data, error } = await sb.from('post_likes')
    .select('*').in('post_id', postIds);
  if (error) return [];
  return data || [];
}

async function dbGetCommentCounts(postIds) {
  const { data, error } = await sb.from('post_comments')
    .select('post_id').in('post_id', postIds);
  if (error) return [];
  return data || [];
}

// ── Friends ───────────────────────────────────────────────────
async function dbSendFriendRequest(toUserId) {
  const user = requireUser();
  const { error } = await sb.from('friendships')
    .insert({ requester_id: user.id, addressee_id: toUserId, status: 'pending' });
  if (error) { dbError(error, 'Send friend request'); return false; }
  return true;
}

async function dbAcceptFriendRequest(id) {
  const { error } = await sb.from('friendships')
    .update({ status: 'accepted' }).eq('id', id);
  if (error) { dbError(error, 'Accept request'); return false; }
  return true;
}

async function dbDeclineFriendRequest(id) {
  const { error } = await sb.from('friendships').delete().eq('id', id);
  if (error) { dbError(error, 'Decline request'); return false; }
  return true;
}

async function dbRemoveFriend(friendshipId) {
  const { error } = await sb.from('friendships').delete().eq('id', friendshipId);
  if (error) { dbError(error, 'Remove friend'); return false; }
  return true;
}

async function dbSearchUsers(query) {
  const { data, error } = await sb.from('usernames')
    .select('user_id,username,display_name')
    .ilike('username', `%${query}%`).limit(10);
  if (error) { dbError(error, 'Search users'); return []; }
  return data || [];
}

async function dbGetPendingRequests(userId) {
  const { data, error } = await sb.from('friendships')
    .select('id,requester_id').eq('addressee_id', userId).eq('status', 'pending');
  if (error) { dbError(error, 'Load pending requests'); return []; }
  return data || [];
}

async function dbGetFriendList() {
  const user = requireUser();
  const { data: friendships, error } = await sb.from('friendships')
    .select('id,requester_id,addressee_id')
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq('status', 'accepted');
  if (error) { dbError(error, 'Load friend list'); return []; }
  return friendships || [];
}

async function dbCheckExistingFriendship(userId1, userId2) {
  const { data } = await sb.from('friendships')
    .select('*')
    .or(`requester_id.eq.${userId1},addressee_id.eq.${userId1}`)
    .or(`requester_id.eq.${userId2},addressee_id.eq.${userId2}`)
    .limit(1);
  return data?.[0] || null;
}

async function dbGetUsernames(userIds) {
  const { data, error } = await sb.from('usernames')
    .select('user_id,username,display_name').in('user_id', userIds);
  if (error) { dbError(error, 'Load usernames'); return []; }
  return data || [];
}

// ── Notifications ─────────────────────────────────────────────
async function dbInsertNotifications(notifications) {
  const { error } = await sb.from('workout_notifications').insert(notifications);
  if (error) console.warn('[dbInsertNotifications]', error.message);
  return !error;
}

async function dbGetFriendNotifPrefs(friendIds) {
  const { data, error } = await sb.from('profiles')
    .select('id,notif_friend_workout').in('id', friendIds);
  if (error) { dbError(error, 'Load notification prefs'); return []; }
  return data || [];
}

async function dbGetMyNotifPrefs() {
  const user = requireUser();
  const { data } = await sb.from('profiles')
    .select('notif_broadcast_workout,notif_friend_workout')
    .eq('id', user.id).single();
  return data || {};
}

// ── Custom splits ─────────────────────────────────────────────
async function dbSaveCustomSplits(splits) {
  const user = requireUser();
  const { error } = await sb.from('profiles')
    .upsert({ id: user.id, custom_splits: splits });
  if (error) { dbError(error, 'Save custom splits'); return false; }
  return true;
}

// ── Tools ─────────────────────────────────────────────────────
async function dbGetToolsData(userId) {
  const [logsRes, weightsRes, prsRes] = await Promise.all([
    sb.from('workout_logs').select('date,volume').eq('user_id', userId)
      .order('date', { ascending: false }).limit(30),
    sb.from('weight_logs').select('date,weight_lbs').eq('user_id', userId)
      .order('date', { ascending: false }).limit(1),
    sb.from('personal_records').select('exercise,weight_lbs,reps')
      .eq('user_id', userId),
  ]);
  return {
    logs: logsRes.data || [],
    latestWeight: weightsRes.data?.[0] || null,
    prs: prsRes.data || [],
  };
}

async function dbUpsertPRRecord(exercise, weightLbs, reps, date, estimated1rm) {
  const user = requireUser();
  const { error } = await sb.from('personal_records').upsert({
    user_id: user.id, exercise,
    weight_lbs: weightLbs, reps, date,
    estimated_orm: estimated1rm,
  }, { onConflict: 'user_id,exercise' });
  if (error) { dbError(error, 'Save PR'); return false; }
  return true;
}

// ── History ───────────────────────────────────────────────────
async function dbGetAllWorkoutLogs(userId) {
  const { data, error } = await sb.from('workout_logs')
    .select('*').eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) { dbError(error, 'Load history'); return []; }
  return data || [];
}

// ── Export ────────────────────────────────────────────────────
async function dbExportWorkouts(userId) {
  const { data, error } = await sb.from('workout_logs')
    .select('*').eq('user_id', userId).order('date', { ascending: false });
  if (error) { dbError(error, 'Export workouts'); return []; }
  return data || [];
}

async function dbExportNutrition(userId) {
  const { data, error } = await sb.from('nutrition_logs')
    .select('*').eq('user_id', userId).order('date', { ascending: false });
  if (error) { dbError(error, 'Export nutrition'); return []; }
  return data || [];
}

async function dbExportWeights(userId) {
  const { data, error } = await sb.from('weight_logs')
    .select('*').eq('user_id', userId).order('date', { ascending: false });
  if (error) { dbError(error, 'Export weights'); return []; }
  return data || [];
}

// ── Monthly recap ─────────────────────────────────────────────
async function dbGetMonthlyRecapData(userId, startDate) {
  const [logsRes, prsRes] = await Promise.all([
    sb.from('workout_logs').select('volume,day_name,date')
      .eq('user_id', userId).gte('date', startDate),
    sb.from('personal_records').select('exercise,weight_lbs,reps')
      .eq('user_id', userId),
  ]);
  return { logs: logsRes.data || [], prs: prsRes.data || [] };
}
