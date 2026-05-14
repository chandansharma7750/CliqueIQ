import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Sparkles } from "lucide-react"

const festivals = [
  { date: "Jan 14", name: "Makar Sankranti", category: "religious", emoji: "🪁", hashtags: ["#MakarSankranti", "#Uttarayan", "#FestivalOfKites"] },
  { date: "Jan 26", name: "Republic Day", category: "national", emoji: "🇮🇳", hashtags: ["#RepublicDay", "#JaiHind", "#India"] },
  { date: "Feb 14", name: "Valentine's Day", category: "other", emoji: "❤️", hashtags: ["#ValentinesDay", "#Love", "#Pyaar"] },
  { date: "Mar 14", name: "Holi", category: "religious", emoji: "🎨", hashtags: ["#Holi", "#HappyHoli", "#FestivalOfColors"] },
  { date: "Mar 31", name: "IPL Season Opens", category: "sports", emoji: "🏏", hashtags: ["#IPL2026", "#CricketFever", "#BCCI"] },
  { date: "Apr 14", name: "Dr. Ambedkar Jayanti", category: "national", emoji: "🕊️", hashtags: ["#AmbedkarJayanti", "#JaiBhim"] },
  { date: "May 12", name: "Mother's Day", category: "other", emoji: "💐", hashtags: ["#MothersDay", "#MaaKaPyaar", "#Grateful"] },
  { date: "Aug 15", name: "Independence Day", category: "national", emoji: "🇮🇳", hashtags: ["#IndependenceDay", "#SwatantrataDiwas", "#JaiHind"] },
  { date: "Aug 26", name: "Janmashtami", category: "religious", emoji: "🦚", hashtags: ["#Janmashtami", "#JaiShreeKrishna", "#HappyJanmashtami"] },
  { date: "Sep 23", name: "Navratri Begins", category: "religious", emoji: "🪔", hashtags: ["#Navratri", "#GarbaFestival", "#DurgaPuja"] },
  { date: "Oct 2", name: "Gandhi Jayanti", category: "national", emoji: "🕊️", hashtags: ["#GandhiJayanti", "#BapuBirthday", "#Ahimsa"] },
  { date: "Oct 20", name: "Dussehra", category: "religious", emoji: "🔥", hashtags: ["#Dussehra", "#Vijayadashami", "#GoodOverEvil"] },
  { date: "Nov 1", name: "Diwali", category: "religious", emoji: "🪔", hashtags: ["#Diwali", "#HappyDiwali", "#FestivalOfLights"] },
  { date: "Nov 5", name: "Bhai Dooj", category: "religious", emoji: "🌺", hashtags: ["#BhaiDooj", "#BrotherSisterLove"] },
  { date: "Dec 25", name: "Christmas", category: "other", emoji: "🎄", hashtags: ["#MerryChristmas", "#Christmas", "#XmasVibes"] },
  { date: "Dec 31", name: "New Year's Eve", category: "other", emoji: "🎆", hashtags: ["#NewYear2027", "#HappyNewYear", "#Celebration"] },
]

const categoryColors: Record<string, string> = {
  religious: "bg-orange-100 text-orange-700",
  national: "bg-green-100 text-green-700",
  sports: "bg-blue-100 text-blue-700",
  ecommerce: "bg-violet-100 text-violet-700",
  financial: "bg-amber-100 text-amber-700",
  other: "bg-slate-100 text-slate-600",
}

export default function CalendarPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Indian Festival Calendar</h2>
          <p className="text-slate-500 mt-1">200+ Indian events with ready-made post templates</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(categoryColors).map(([cat, cls]) => (
            <Badge key={cat} className={cls}>{cat}</Badge>
          ))}
        </div>
      </div>

      {/* Upcoming highlighted */}
      <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 flex items-center gap-4">
        <div className="text-4xl">🪔</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">Diwali — Nov 1, 2026</h3>
            <Badge className="bg-orange-100 text-orange-700">Religious</Badge>
            <Badge variant="secondary" className="text-xs">28 days away</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            India&apos;s biggest shopping & festive season. Plan Diwali campaigns 2–3 weeks in advance for maximum reach.
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {["#Diwali", "#HappyDiwali", "#FestivalOfLights", "#DiwaliOffer"].map((h) => (
              <span key={h} className="text-xs text-orange-700 bg-white rounded px-2 py-0.5 border border-orange-200">{h}</span>
            ))}
          </div>
        </div>
        <Button className="flex-shrink-0 gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Post
        </Button>
      </div>

      {/* Festival list */}
      <div className="grid gap-3">
        {festivals.map((f, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-2xl w-10 text-center flex-shrink-0">{f.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-900">{f.name}</span>
                  <Badge className={`${categoryColors[f.category]} text-xs`}>{f.category}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {f.date}, 2026
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {f.hashtags.slice(0, 2).map((h) => (
                      <span key={h} className="text-xs text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="flex-shrink-0 gap-1 text-xs">
                <Sparkles className="h-3 w-3" />
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400">
        Showing 16 of 200+ events. Dates are for 2026. Religious event dates may vary by lunar calendar.
      </p>
    </div>
  )
}
