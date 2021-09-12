import { getCurrentSemesters, getInSessionSemester, getSemesters } from "#umass/calendar";
import { Semester } from "#umass/types";

import { capitalize, oneLine } from "#shared/stringUtil";

import { MessageEmbedBuilder } from "#discord/classes/MessageEmbedBuilder";
import { SlashCommandBuilder } from "#discord/classes/SlashCommandBuilder";
import { CommandError } from "#discord/classes/CommandError";
import { createChoiceListener } from "../createChoiceListener";

function makeSemesterEmbed(semester: Semester) {
  return new MessageEmbedBuilder({
    title: `Academic Calendar for ${capitalize(semester.season)} ${semester.year}`,
    description: semester.events.reduce((prev, current) => {
      return prev + `**${current.date.toLocaleDateString()}**: ${current.description}\n`;
    }, ""),
  });
}

export default new SlashCommandBuilder()
  .setName("calendar")
  .setDescription("Lists out academic events for the current in-session semester.")
  .setGroup("Information")
  .setDetails(
    oneLine(`On a weekly basis, a child process will scrape the following [webpage](https://www.umass.edu/registrar/calendars/academic-calendar)
    and store academic calender information in a database. This command will query that database and attempt to get the academic calendar of the
    current in-session semester. If there are no in-session semesters, the command will fallback and fetch semesters that have not completed.
    A semester is considered in-session if the current date is between the first and last day of classes. A semester is considered complete
    if there are no events left in the semester. As an example, a semester that is currently in finals week is not in-session and incomplete.`),
  )
  .setCallback(async interaction => {
    const semester = getInSessionSemester();
    if (!semester) {
      let semesters = getCurrentSemesters();

      if (semesters.length === 1) return makeSemesterEmbed(semesters[0]);
      else if (semesters.length === 0) {
        const now = Date.now();
        semesters = getSemesters().filter(sem => sem.startDate.valueOf() > now);
        if (semesters.length === 0)
          throw new CommandError(
            oneLine(`I'm sorry. It seems that I do not have the next semester in my database. You can find calender information here: 
              https://www.umass.edu/registrar/calendars/academic-calendar`),
          );

        let closest = semesters[0];
        let closestDiff = closest.startDate.valueOf() - now;
        for (let i = 1; i < semesters.length; i++) {
          const diff = semesters[i].startDate.valueOf() - now;
          if (diff < closestDiff) {
            closest = semesters[i];
            closestDiff = diff;
          }
        }

        return makeSemesterEmbed(closest);
      } else {
        createChoiceListener(
          interaction,
          "Which semester would you like to see?",
          semesters.map(semester => {
            const embed = makeSemesterEmbed(semester);
            return {
              name: embed.title!,
              onChoose: () => embed,
            };
          }),
        );
      }
    } else {
      return makeSemesterEmbed(semester);
    }
  });
