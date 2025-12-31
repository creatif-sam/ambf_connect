import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type PageProps = {
  params: {
    eventId: string
  }
}

export default async function AgendaEditorPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  const { data: days } = await supabase
    .from("agenda_days")
    .select("*")
    .eq("event_id", params.eventId)
    .order("day_date", { ascending: true })

  async function addDay(formData: FormData) {
    "use server"

    const supabase = await createSupabaseServerClient()

    await supabase.from("agenda_days").insert({
      event_id: params.eventId,
      day_label: formData.get("day_label"),
      day_date: formData.get("day_date")
    })

    revalidatePath(`/dashboard/events/${params.eventId}/agenda`)
  }

  async function deleteDay(id: string) {
    "use server"

    const supabase = await createSupabaseServerClient()
    await supabase.from("agenda_days").delete().eq("id", id)

    revalidatePath(`/dashboard/events/${params.eventId}/agenda`)
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-semibold">
        Agenda Builder
      </h1>

      <section className="border rounded-lg p-6 bg-white space-y-4">
        <h2 className="font-medium">
          Add agenda day
        </h2>

        <form action={addDay} className="grid gap-3">
          <input
            name="day_label"
            placeholder="Day 1"
            required
            className="border rounded px-3 py-2"
          />

          <input
            type="date"
            name="day_date"
            required
            className="border rounded px-3 py-2"
          />

          <button
            type="submit"
            className="self-start px-4 py-2 bg-black text-white rounded"
          >
            Add day
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">
          Existing agenda days
        </h2>

        {!days || days.length === 0 ? (
          <p className="text-gray-500">
            No agenda days created yet.
          </p>
        ) : (
          days.map(day => (
            <div
              key={day.id}
              className="flex justify-between items-center border rounded p-4"
            >
              <div>
                <p className="font-medium">
                  {day.day_label}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(day.day_date).toDateString()}
                </p>
              </div>

              <form action={deleteDay.bind(null, day.id)}>
                <button
                  type="submit"
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </form>
            </div>
          ))
        )}
      </section>
    </main>
  )
}
