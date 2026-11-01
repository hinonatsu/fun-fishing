export interface DiagnosisOption { value: string; label: string; description: string; icon: string }
export interface DiagnosisQuestion { id: string; title: string; description: string; options: DiagnosisOption[] }

export const questions: DiagnosisQuestion[] = [
  { id: 'goal', title: 'どんな楽しみを見つけたい？', description: 'いま、一番わくわくするものを選んでください。', options: [
    { value: 'food', label: '釣った魚をおいしく食べたい', description: '自分で釣った一匹を、食卓へ。', icon: '🍽️' },
    { value: 'fight', label: '魚とのやり取りを楽しみたい', description: '竿に伝わる引きに、わくわくしたい。', icon: '🎣' },
    { value: 'first', label: 'まずは一匹、釣ってみたい', description: 'はじめての「釣れた！」を体験したい。', icon: '🐟' },
    { value: 'either', label: 'どれも楽しそう', description: 'おすすめを見ながら決めたい。', icon: '✨' },
  ] },
  { id: 'pace', title: '海では、どう過ごしたい？', description: '理想の休日をイメージしてみましょう。', options: [
    { value: 'calm', label: 'のんびり、魚の反応を待つ', description: '景色や会話も楽しみたい。', icon: '☕' },
    { value: 'active', label: '動きながら、魚を探す', description: '自分から魚に近づく釣りが気になる。', icon: '🏃' },
    { value: 'either', label: 'どちらも気になる', description: '自分に合うスタイルを知りたい。', icon: '🌊' },
  ] },
  { id: 'budget', title: '道具一式の予算は？', description: '道具選びの目安にします。価格が未確認の候補もあるため、予算内の保証ではありません。', options: [
    { value: '20000', label: '2万円以内を目指したい', description: '必要なものを、できるだけ手頃に。', icon: '👛' },
    { value: '30000', label: '3万円以内を目指したい', description: '扱いやすさとのバランスを大切に。', icon: '⚖️' },
    { value: 'flexible', label: '使いやすさを優先したい', description: '納得できるものを選びたい。', icon: '🌱' },
    { value: 'unsure', label: '相場を見ながら決めたい', description: 'まずは必要な道具を知りたい。', icon: '💭' },
  ] },
  { id: 'experience', title: '釣りの経験はありますか？', description: '道具を選ぶときの説明に役立てます。', options: [
    { value: 'first', label: '釣りは初めて', description: '準備から、ひとつずつ知りたい。', icon: '🌱' },
    { value: 'some', label: '経験はあるが、道具の準備は初めて', description: '一度だけ連れていってもらった人もこちら。', icon: '🎣' },
    { value: 'experienced', label: '自分で準備したことがある', description: '仕様を見ながら比較したい。', icon: '🧰' },
  ] },
  { id: 'bait', title: 'エサを使う釣りはどうですか？', description: '苦手なことも、選ぶための大切なヒントです。', options: [
    { value: 'okay', label: 'エサを使っても大丈夫', description: '釣り方に合わせて準備したい。', icon: '🦐' },
    { value: 'avoid', label: 'なるべく触りたくない', description: '手が汚れにくい準備がうれしい。', icon: '🧤' },
    { value: 'unsure', label: 'まだわからない', description: 'どんなエサか見てから決めたい。', icon: '💭' },
  ] },
  { id: 'transport', title: '釣り場へは、どうやって？', description: '持ち運びやすさの参考にします。', options: [
    { value: 'train', label: '電車やバス', description: 'コンパクトに持ち歩きたい。', icon: '🚃' },
    { value: 'car', label: '車', description: '荷物をまとめて運べる。', icon: '🚗' },
    { value: 'walk', label: '徒歩や自転車', description: '身軽に、近くの海へ。', icon: '🚲' },
  ] },
  { id: 'company', title: '誰と釣りを楽しみたい？', description: 'その日の過ごし方を、もう少し教えてください。', options: [
    { value: 'solo', label: 'ひとりで気ままに', description: '自分のペースで楽しみたい。', icon: '🧢' },
    { value: 'family', label: '家族と一緒に', description: 'みんなで過ごす時間にしたい。', icon: '👨‍👩‍👧' },
    { value: 'friends', label: '友人やパートナーと', description: '初めての体験を共有したい。', icon: '🤝' },
  ] },
  { id: 'priority', title: '道具選びで一番大切なのは？', description: 'おすすめを並べるときの優先順位にします。', options: [
    { value: 'easy', label: '扱いやすさ', description: '準備がわかりやすいものを選びたい。', icon: '👌' },
    { value: 'cost', label: '購入費用', description: '確認できた価格を比べて選びたい。', icon: '👛' },
    { value: 'specs', label: '仕様を確認できること', description: '用途や素材に納得して選びたい。', icon: '🔎' },
  ] },
  { id: 'water', title: '手や道具を洗う水は、どこで用意しますか？', description: '水の用意に合うバケツを選びます。施設が決まっていなければ、あとで確認できます。', options: [
    { value: 'tap', label: '施設の水道などで用意する', description: '地上で水を入れる容器として使う。', icon: '🚰' },
    { value: 'sea', label: '海からロープで水をくむ', description: '水くみ用の釣り専用品が必要。', icon: '🪣' },
    { value: 'unsure', label: '釣り場が決まってから確認する', description: '水道の有無と、水くみができる場所を施設に聞きます。', icon: '💭' },
  ] },
  { id: 'time', title: 'どの時間帯に出かけたい？', description: '釣果を予測する質問ではありません。釣行メモとして保存します。', options: [
    { value: 'morning', label: '朝から', description: '早起きして、海で一日を始めたい。', icon: '🌅' },
    { value: 'day', label: '明るい日中に', description: '無理のない時間に出かけたい。', icon: '☀️' },
    { value: 'unsure', label: 'まだ決めていない', description: '釣り場の営業時間を見て決める。', icon: '🕐' },
  ] },
  { id: 'cleanup', title: '準備や片づけは？', description: '使う日のこともイメージしてみましょう。', options: [
    { value: 'simple', label: 'できるだけ手軽にしたい', description: '準備の少ない候補がうれしい。', icon: '🧺' },
    { value: 'okay', label: '道具の手入れも楽しみたい', description: '使い方を覚えていきたい。', icon: '🧽' },
    { value: 'unsure', label: '使いながら考えたい', description: 'まずは基本の道具から。', icon: '🌱' },
  ] },
  { id: 'keep', title: '釣れた魚は、どうしたい？', description: '魚を持ち帰る場合の準備メモにします。', options: [
    { value: 'eat', label: '持ち帰って料理したい', description: '保冷用品なども準備する。', icon: '🍳' },
    { value: 'release', label: '観察して、海へ返したい', description: '魚を傷めにくい扱い方を確認する。', icon: '🐟' },
    { value: 'unsure', label: '釣れてから考えたい', description: '持ち帰りのルールも確認する。', icon: '💭' },
  ] },
];

export const requiredQuestions = questions.slice(0, 3);
export function validAnswers(value: unknown): value is Record<string, string> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && Object.entries(value).every(([id, answer]) => questions.some(q => q.id === id && q.options.some(o => o.value === answer)));
}
