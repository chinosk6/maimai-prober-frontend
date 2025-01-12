import { useEffect, useState } from 'react';
import {
  Container,
  createStyles,
  rem,
  Card,
  Title,
  Text,
  Group,
  Loader,
  Anchor,
  UnstyledButton,
  UnstyledButtonProps,
  Badge,
  Button,
  Flex,
} from '@mantine/core';
import { getDevelopers, revokeDeveloper } from "../../utils/api/developer";
import { mdiChevronRight, mdiReload, mdiTrashCan } from "@mdi/js";
import Icon from '@mdi/react';
import { EditUserModal, UserProps } from "./Users";
import { useDisclosure } from "@mantine/hooks";
import { permissionToList, UserPermission } from "../../utils/session";
import useAlert from "../../utils/useAlert";
import AlertModal from "../../components/AlertModal";

const useStyles = createStyles((theme) => ({
  root: {
    padding: rem(16),
    maxWidth: rem(600),
  },

  card: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
  },

  section: {
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    padding: theme.spacing.md,
  },

  user: {
    display: 'block',
    width: '100%',
    padding: theme.spacing.md,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
    },
  },
}));

interface DeveloperProps {
  id: number;
  user: UserProps;
  name: string;
  url: string;
  reason: string;
  apply_time: string;
  api_key: string;
}

export function UserButton({ user, onClick, ...others }: { user: UserProps, onClick?: () => void } & UnstyledButtonProps) {
  const { classes } = useStyles();

  return (
    <UnstyledButton className={classes.user} onClick={onClick} {...others}>
      <Group>
        <div style={{ flex: 1 }}>
          <Flex align="center">
            <Text size="sm" weight={500} mr="xs">
              {user.name}
            </Text>
            {permissionToList(user.permission).indexOf(UserPermission.Developer) !== -1 ? (
              <Badge color="blue" variant="light">开发者</Badge>
            ) : (
              <Badge color="red" variant="light">非开发者</Badge>
            )}
          </Flex>

          <Text color="dimmed" size="xs">{user.email}</Text>
        </div>

        <Icon path={mdiChevronRight} size={0.75} color="dimmed" />
      </Group>
    </UnstyledButton>
  );
}

interface DeveloperCardProps {
  developer: DeveloperProps;
  userOnClick?: () => void;
  openAlert: (title: string, content: string) => void;
  setConfirmAlert?: (confirm: () => void) => void;
}

const DeveloperCard = ({ developer, userOnClick, openAlert, setConfirmAlert, ...others }: DeveloperCardProps & UnstyledButtonProps) => {
  const { classes } = useStyles();

  const _delete = () => {
    revokeDeveloper(developer)
      .then((res) => res?.json())
      .then((data) => {
        if (data.code !== 200) {
          setConfirmAlert?.(() => {});
          openAlert("删除开发者失败", data.message);
        } else {
          window.location.reload();
        }
      });
  }

  return (
    <Card withBorder radius="md" className={classes.card} {...others}>
      <Card.Section className={classes.section} p={0}>
        <UserButton user={developer.user} onClick={userOnClick} />
      </Card.Section>
      <Card.Section className={classes.section}>
        <Group position="apart">
          <div>
            <Text fz="xs" c="dimmed">项目名称</Text>
            <Text fz="sm">{developer.name}</Text>
          </div>
          <div>
            <Text fz="xs" c="dimmed">项目地址</Text>
            <Text fz="sm">
              <Anchor href={developer.url} target="_blank" truncate>{developer.url}</Anchor>
            </Text>
          </div>
          <div>
            <Text fz="xs" c="dimmed">申请时间</Text>
            <Text fz="sm">
              {new Date(developer.apply_time).toLocaleString()}
            </Text>
          </div>
        </Group>
        <Text fz="xs" c="dimmed" mt="md">申请理由</Text>
        <Text fz="sm">{developer.reason}</Text>
      </Card.Section>
      <Card.Section className={classes.section}>
        <Group position="right">
          {permissionToList(developer.user.permission).indexOf(UserPermission.Developer) !== -1 && (
            <Button variant="outline" size="sm" leftIcon={<Icon path={mdiReload} size={0.75} />}>
              重置 API 密钥
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            color="red"
            leftIcon={<Icon path={mdiTrashCan} size={0.75} />}
            onClick={() => {
              setConfirmAlert?.(() => _delete);
              openAlert("删除开发者", "确定要删除这个开发者吗？");
            }}
          >
            删除开发者
          </Button>
        </Group>
      </Card.Section>
    </Card>
  )
}

export default function Developers() {
  const { isAlertVisible, alertTitle, alertContent, openAlert, closeAlert } = useAlert();
  const { classes } = useStyles();
  const [confirmAlert, setConfirmAlert] = useState<() => void>(() => {});
  const [developers, setDevelopers] = useState<DeveloperProps[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [opened, { open, close }] = useDisclosure(false);
  const [activeUser, setActiveUser] = useState<UserProps | null>(null);

  useEffect(() => {
    document.title = "管理开发者 | maimai DX 查分器";

    getDevelopers()
      .then((res) => res?.json())
      .then((data) => {
        setDevelopers(data.data.sort((a: DeveloperProps, b: DeveloperProps) => {
          return new Date(b.apply_time).getTime() - new Date(a.apply_time).getTime();
        }));
        setIsLoaded(true);
      });
  }, []);

  return (
    <Container className={classes.root}>
      <AlertModal
        title={alertTitle}
        content={alertContent}
        opened={isAlertVisible}
        onClose={closeAlert}
        onConfirm={confirmAlert}
      />
      <EditUserModal user={activeUser as UserProps} opened={opened} close={() => close()} />
      <Title order={2} size="h2" weight={900} align="center" mt="xs">
        管理开发者
      </Title>
      <Text color="dimmed" size="sm" align="center" mt="sm" mb="xl">
        查看并管理 maimai DX 查分器的开发者
      </Text>
      {!isLoaded ? (
        <Group position="center" mt="xl">
          <Loader />
        </Group>
      ) : (
        developers.map((developer) => (
          <DeveloperCard
            key={developer.id}
            developer={developer}
            userOnClick={
              () => {
                setActiveUser(developer.user);
                open();
              }
            }
            openAlert={openAlert}
            setConfirmAlert={setConfirmAlert}
            mb="md"
          />
        ))
      )}
    </Container>
  );
}
