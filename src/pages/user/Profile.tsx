import { useEffect, useState } from 'react';
import {
  Container,
  createStyles,
  Text,
  Title,
  rem,
  Group,
  Loader,
} from '@mantine/core';
import { getPlayerDetail } from '../../utils/api/player';
import { getProfile } from '../../utils/api/user';
import { PlayerSection } from '../../components/Profile/PlayerSection';
import { UserDataProps, UserSection } from '../../components/Profile/UserSection';
import { UserBindSection } from '../../components/Profile/UserBindSection';

const useStyles = createStyles((theme) => ({
  root: {
    padding: rem(16),
    maxWidth: rem(600),
  },

  card: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },
}));

export default function Profile() {
  const { classes } = useStyles();
  const [playerData, setPlayerData] = useState(null);
  const [userData, setUserData] = useState<UserDataProps | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.title = "账号详情 | maimai DX 查分器";

    Promise.all([getPlayerDetail(), getProfile()]).then((responses) => {
      const [playerResponse, userResponse] = responses;

      if (playerResponse?.status === 200) {
        playerResponse.json().then((data) => {
          setPlayerData(data.data);
        });
      }

      if (userResponse?.status === 200) {
        userResponse.json().then((data) => {
          setUserData(data.data);
        });
      }
      setIsLoaded(true);
    });
  }, []);

  return (
    <Container className={classes.root} size={400}>
      <Title order={2} size="h2" weight={900} align="center" mt="xs">
        账号详情
      </Title>
      <Text color="dimmed" size="sm" align="center" mt="sm" mb="xl">
        查看你的 maimai DX 查分器账号的详情与游戏数据
      </Text>
        {!isLoaded ? (
          <Group position="center" mt="xl">
            <Loader />
          </Group>
        ) : (
          <>
            <PlayerSection playerData={playerData} />
            {userData && <UserSection userData={userData} />}
            {userData?.bind && <UserBindSection userBind={userData.bind} />}
          </>
        )}
    </Container>
  );
}
