import { Badge, Card, createStyles, Flex, Group, rem, Text, useMantineTheme } from "@mantine/core";
import { difficultyColor } from "../../utils/color";
import { getDifficulty, SongProps } from "../../utils/api/song";
import { memo } from "react";

export interface ScoreProps {
  id: number;
  song_name: string;
  level: string;
  level_index: number;
  achievements: number;
  fc: string;
  fs: string;
  dx_score: number;
  dx_rating: number;
  rate: string;
  type: string;
  upload_time: string;
}

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    color: theme.colorScheme === 'dark' ? theme.colors.gray[9] : theme.white,
  },

  scoreCard: {
    cursor: 'pointer',
    transition: 'transform 200ms ease',

    '&:hover': {
      transform: 'scale(1.03)',
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      boxShadow: theme.shadows.md,
      borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2],
      borderRadius: theme.radius.md,
      zIndex: 1,
    }
  }
}));

export const Score = memo(({ score, song, onClick }: { score: ScoreProps, song: SongProps, onClick: () => void }) => {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Card
      shadow="sm"
      radius="md"
      p={0}
      className={[classes.card, classes.scoreCard].join(' ')}
      style={{
        border: `2px solid ${difficultyColor[2][score.level_index]}`,
        backgroundColor: difficultyColor[1][score.level_index],
        opacity: theme.colorScheme === 'dark' ? 0.8 : 1,
      }}
      onClick={onClick}
    >
      <Flex pt={5} pb={2} pl="xs" pr="xs" style={{
        backgroundColor: difficultyColor[2][score.level_index]
      }}>
        <Text size="sm" weight={500} truncate style={{ flex: 1 }} color="white">{score.song_name}</Text>
        {score.type === "standard" ? (
          <Badge variant="filled" color="blue" size="sm">标准</Badge>
        ) : (
          <Badge variant="filled" color="orange" size="sm">DX</Badge>
        )}
      </Flex>
      <Group position="apart" m={10} mt={5} mb={5}>
        <div>
          <Text fz={rem(24)} style={{ lineHeight: rem(24) }} color="white">
            {parseInt(String(score.achievements))}
            <span style={{ fontSize: rem(16) }}>.{
              (String(score.achievements).split(".")[1] || "0").padEnd(4, "0")
            }%</span>
          </Text>
          <Text size="xs" color="white">
            DX Rating: {parseInt(String(score.dx_rating))}
          </Text>
        </div>
        <Card w={40} h={30} p={0} radius="md" withBorder>
          <Text size="md" weight={500} align="center" style={{
            lineHeight: rem(28),
          }}>
            {song != null ? getDifficulty(song, score.type, score.level_index)?.level_value.toFixed(1) : score.level}
          </Text>
        </Card>
      </Group>
    </Card>
  )
});